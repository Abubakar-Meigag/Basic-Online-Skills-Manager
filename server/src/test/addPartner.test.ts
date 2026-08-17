import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";
import pool from "../data/connection";
import { OrganizationType } from "../data/dataType";

vi.mock("../data/connection", () => ({
  default: { query: vi.fn() },
}));

// Middleware reads JWT_SECRET at verify time, so set it before any request runs.
process.env.JWT_SECRET = "test-secret";

// A valid CYF-staff token
const staffToken = jwt.sign(
  {
    id: "user-1",
    email: "staff@codeyourfuture.io",
    orgType: OrganizationType.CYF_STAFF,
    organisationId: "org-1",
  },
  process.env.JWT_SECRET,
  { algorithm: "HS256", expiresIn: "1h" },
);

const auth = `Bearer ${staffToken}`;

describe("POST /addPartner", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("creates an organisation and returns 201", async () => {
    (pool.query as any)
      // duplicate-check query no existing org
      .mockResolvedValueOnce({ rows: [] })
      // insert query returns the new org
      .mockResolvedValueOnce({
        rows: [
          {
            id: "org-1",
            organisation_name: "Deloitte",
            type: "commercial",
            email_domain: "deloitte.com",
            city: "London",
            created_at: "2026-08-06T00:00:00.000Z",
          },
        ],
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

    expect(response.status).toBe(201);
    expect(response.body.organisation.organisation_name).toBe("Deloitte");
    expect(response.body.organisation.city).toBe("London");
  });

  it("lowercases the email_domain before insert", async () => {
    (pool.query as any)
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [{ id: "org-2", organisation_name: "Deloitte", city: "London" }],
      });

    await request(app).post("/addPartner").set("Authorization", auth).send({
      organisation_name: "Deloitte",
      type: "commercial",
      email_domain: "Deloitte.COM",
      city: "London",
    });

    // second call is the INSERT; its params array is the 2nd arg
    const insertParams = (pool.query as any).mock.calls[1][1];
    expect(insertParams).toContain("deloitte.com");
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
    (pool.query as any)
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          { id: "org-3", organisation_name: "CodeYourFuture", city: "London" },
        ],
      });

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
    (pool.query as any).mockResolvedValueOnce({
      rows: [{ id: "existing-org" }],
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
  });

  it("returns 500 when a query fails", async () => {
    (pool.query as any).mockRejectedValueOnce(new Error("DB down"));

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
