import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";
import pool from "../data/connection";
import { OrganizationType } from "../data/dataType";
import { withMockedQueries } from "./helpers/mockQueries";
import { JWT_TEST_SECRET } from "./helpers/testSecret";

const mockClient = vi.hoisted(() => ({ query: vi.fn(), release: vi.fn() }));

vi.mock("../data/connection", () => ({
  default: {
    query: mockClient.query,
    connect: vi.fn().mockResolvedValue(mockClient),
  },
}));

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
  JWT_TEST_SECRET,
  { algorithm: "HS256", expiresIn: "1h" },
);

const auth = [`token=${staffToken}`];

describe("POST /addPartner", () => {
  afterEach(() => {
    vi.clearAllMocks();
    mockClient.query.mockReset(); // so a mockImplementation never leaks into the next test
    (pool.connect as any).mockResolvedValue(mockClient);
  });

  it("creates an organisation and returns 201", async () => {
    const response = await withMockedQueries(
      mockClient,
      Path({
        id: "org-1",
        organisation_name: "Deloitte",
        type: "commercial",
        email_domain: "deloitte.com",
        city: "London",
        created_at: "2026-08-06T00:00:00.000Z",
      }),
      async () =>
        request(app).post("/addPartner").set("Cookie", auth).send({
          organisation_name: "Deloitte",
          type: "commercial",
          email_domain: "deloitte.com",
          city: "London",
        }),
    );

    expect(response.status).toBe(201);
    expect(response.body.organisation.organisation_name).toBe("Deloitte");
    expect(response.body.organisation.city).toBe("London");
    expect(mockClient.release).toHaveBeenCalledTimes(1);
  });

  it("lowercases the email_domain before insert", async () => {
    await withMockedQueries(
      mockClient,
      Path({ id: "org-2", organisation_name: "Deloitte", city: "London" }),
      async () =>
        request(app).post("/addPartner").set("Cookie", auth).send({
          organisation_name: "Deloitte",
          type: "commercial",
          email_domain: "Deloitte.COM",
          city: "London",
        }),
    );

    // asserted after the helper returns; the calls are still recorded
    const insertCall = mockClient.query.mock.calls.find((c) =>
      String(c[0]).includes("INSERT INTO organisations"),
    );
    expect(insertCall?.[1]).toContain("deloitte.com");
  });

  it("returns 400 when a required field is missing", async () => {
    const response = await request(app)
      .post("/addPartner")
      .set("Cookie", auth)
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
      .set("Cookie", auth)
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
    const response = await withMockedQueries(
      mockClient,
      Path({
        id: "org-3",
        organisation_name: "CodeYourFuture",
        city: "London",
      }),
      async () =>
        request(app).post("/addPartner").set("Cookie", auth).send({
          organisation_name: "CodeYourFuture",
          type: "cyf_staff",
          email_domain: "codeyourfuture.io",
          city: "London",
        }),
    );

    expect(response.status).toBe(201);
  });

  it("returns 400 for a malformed email_domain", async () => {
    const response = await request(app)
      .post("/addPartner")
      .set("Cookie", auth)
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
    const response = await withMockedQueries(
      mockClient,
      {
        BEGIN: undefined,
        "SELECT id FROM organisations": { rows: [{ id: "existing-org" }] }, // org already exists
        ROLLBACK: undefined, // the controller rolls back before returning 409
      },
      async () =>
        request(app).post("/addPartner").set("Cookie", auth).send({
          organisation_name: "Capgemini",
          type: "commercial",
          email_domain: "capgemini.com",
          city: "London",
        }),
    );

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("error");
    expect(mockClient.release).toHaveBeenCalledTimes(1);
  });

  it("returns 500 when a query fails", async () => {
    const response = await withMockedQueries(
      mockClient,
      {
        BEGIN: undefined,
        "SELECT id FROM organisations": new Error("DB down"),
        ROLLBACK: undefined, // the catch block rolls back
      },
      async () =>
        request(app).post("/addPartner").set("Cookie", auth).send({
          organisation_name: "Deloitte",
          type: "commercial",
          email_domain: "deloitte.com",
          city: "London",
        }),
    );

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
    expect(mockClient.release).toHaveBeenCalledTimes(1);
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
