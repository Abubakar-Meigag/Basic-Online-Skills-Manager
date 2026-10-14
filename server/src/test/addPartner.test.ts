import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";
import pool from "../data/connection";
import { OrganizationType } from "../data/dataType";

const mockClient = vi.hoisted(() => ({ query: vi.fn(), release: vi.fn() }));

vi.mock("../data/connection", () => ({
  default: { query: mockClient.query, connect: vi.fn().mockResolvedValue(mockClient) },
}));

const JWT_SECRET = "test-secret";

// Answers each client.query by matching its SQL text, and throws "Unexpected query" for any query not listed.
const mockQueries = (responses: Record<string, unknown>) => {
  mockClient.query.mockImplementation(async (sql: string) => {
    const key = Object.keys(responses).find((k) => sql.includes(k));
    if (key === undefined) throw new Error(`Unexpected query: ${sql}`);
    const result = responses[key];
    if (result instanceof Error) throw result;
    return result;
  });
};

// new helper. The normal successful sequence of queries for addPartner.
const Path = (org: Record<string, unknown>) => ({
  BEGIN: undefined,
  "SELECT id FROM organisations": { rows: [] }, // no existing org
  "INSERT INTO organisations": { rows: [org] },
  "INSERT INTO audit_log": undefined,
  COMMIT: undefined,
});

// A valid CYF-staff token
const staffToken = jwt.sign(
  {
    id: "user-1",
    email: "staff@codeyourfuture.io",
    orgType: OrganizationType.CYF_STAFF,
    organisationId: "org-1",
  },
  JWT_SECRET,
  { algorithm: "HS256", expiresIn: "1h" },
);

const auth = `Bearer ${staffToken}`;

describe("POST /addPartner", () => {
  afterEach(() => {
    vi.clearAllMocks();
    mockClient.query.mockReset(); // so a mockImplementation never leaks into the next test
    (pool.connect as any).mockResolvedValue(mockClient);
  });

  it("creates an organisation and returns 201", async () => {

    mockQueries(
      Path({
        id: "org-1",
        organisation_name: "Deloitte",
        type: "commercial",
        email_domain: "deloitte.com",
        city: "London",
        created_at: "2026-08-06T00:00:00.000Z",
      }),
    );

    const response = await request(app)
      .post("/addPartner")
      .set("Authorization", auth)
      .send({
        organisation_name: "Deloitte",
        type: "commercial",
        email_domain: "deloitte.com",
        city: "London",
      });

    expect(response.status).toBe(201);
    expect(response.body.organisation.organisation_name).toBe("Deloitte");
    expect(response.body.organisation.city).toBe("London");
    expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
  });

  it("lowercases the email_domain before insert", async () => {
    mockQueries(
      Path({ id: "org-2", organisation_name: "Deloitte", city: "London" }),
    );

    await request(app).post("/addPartner").set("Authorization", auth).send({
      organisation_name: "Deloitte",
      type: "commercial",
      email_domain: "Deloitte.COM",
      city: "London",
    });

    // find the INSERT by its SQL instead of mock.calls[2], which depended on call order
    const insertCall = mockClient.query.mock.calls.find((c) =>
      String(c[0]).includes("INSERT INTO organisations"),
    );
    expect(insertCall?.[1]).toContain("deloitte.com");
  });

  it("returns 400 when a required field is missing", async () => {
    const response = await request(app)
      .post("/addPartner")
      .set("Authorization", auth)
      .send({
        organisation_name: "Deloitte",
        type: "commercial",
        email_domain: "deloitte.com",
        // city missing
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid type", async () => {
    const response = await request(app)
      .post("/addPartner")
      .set("Authorization", auth)
      .send({
        organisation_name: "Deloitte",
        type: "not_a_real_type",
        email_domain: "deloitte.com",
        city: "London",
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("accepts cyf_staff as a valid type", async () => {
    mockQueries(
      Path({
        id: "org-3",
        organisation_name: "CodeYourFuture",
        city: "London",
      }),
    );

    const response = await request(app)
      .post("/addPartner")
      .set("Authorization", auth)
      .send({
        organisation_name: "CodeYourFuture",
        type: "cyf_staff",
        email_domain: "codeyourfuture.io",
        city: "London",
      });

    expect(response.status).toBe(201);
  });

  it("returns 400 for a malformed email_domain", async () => {
    const response = await request(app)
      .post("/addPartner")
      .set("Authorization", auth)
      .send({
        organisation_name: "Deloitte",
        type: "commercial",
        email_domain: "@deloitte.com",
        city: "London",
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("returns 409 when the organisation name or email_domain already exists", async () => {

    mockQueries({
      BEGIN: undefined,
      "SELECT id FROM organisations": { rows: [{ id: "existing-org" }] }, // org already exists
      ROLLBACK: undefined, // the controller rolls back before returning 409
    });

    const response = await request(app)
      .post("/addPartner")
      .set("Authorization", auth)
      .send({
        organisation_name: "Capgemini",
        type: "commercial",
        email_domain: "capgemini.com",
        city: "London",
      });

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("error");
    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
  });

  it("returns 500 when a query fails", async () => {

    mockQueries({
      BEGIN: undefined,
      "SELECT id FROM organisations": new Error("DB down"),
      ROLLBACK: undefined, // the catch block rolls back
    });

    const response = await request(app)
      .post("/addPartner")
      .set("Authorization", auth)
      .send({
        organisation_name: "Deloitte",
        type: "commercial",
        email_domain: "deloitte.com",
        city: "London",
      });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });

  it("returns 401 when no token is provided", async () => {
    const response = await request(app).post("/addPartner").send({
      organisation_name: "Deloitte",
      type: "commercial",
      email_domain: "deloitte.com",
      city: "London",
    });

    expect(response.status).toBe(401);
    expect(pool.query).not.toHaveBeenCalled();
  });
});