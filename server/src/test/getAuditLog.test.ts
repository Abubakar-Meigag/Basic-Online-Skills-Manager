import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";
import pool from "../data/connection";
import { OrganizationType } from "../data/dataType";

vi.mock("../data/connection", () => ({
  default: { query: vi.fn() },
}));

process.env.JWT_SECRET = "test-secret";

const makeToken = (orgType: string) =>
  jwt.sign(
    {
      id: "user-1",
      email: "user@example.com",
      orgType,
      organisationId: "org-1",
    },
    process.env.JWT_SECRET as string,
    { algorithm: "HS256", expiresIn: "1h" },
  );

const staffAuth = `Bearer ${makeToken(OrganizationType.CYF_STAFF)}`;
const outreachAuth = `Bearer ${makeToken(OrganizationType.OUTREACH_PARTNER)}`;

describe("GET /audit-log", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with a flat array of entries, newest first", async () => {
    (pool.query as any).mockResolvedValueOnce({
      rows: [
        {
          id: "al-2",
          user_id: "user-1",
          user_email: "admin@codeyourfuture.io",
          action: "user.created",
          entity_type: "user",
          entity_id: "user-9",
          created_at: "2026-07-22T14:32:00.000Z",
        },
        {
          id: "al-1",
          user_id: "user-1",
          user_email: "admin@codeyourfuture.io",
          action: "create_organisation",
          entity_type: "organisation",
          entity_id: "org-3",
          created_at: "2026-07-13T08:45:00.000Z",
        },
      ],
    });

    const response = await request(app)
      .get("/audit-log")
      .set("Authorization", staffAuth);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].user_email).toBe("admin@codeyourfuture.io");
    expect(response.body[0].action).toBe("user.created");
  });

  it("returns 200 with an empty array when there are no entries", async () => {
    (pool.query as any).mockResolvedValueOnce({ rows: [] });

    const response = await request(app)
      .get("/audit-log")
      .set("Authorization", staffAuth);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("returns 403 when the caller is not CYF staff", async () => {
    const response = await request(app)
      .get("/audit-log")
      .set("Authorization", outreachAuth);

    expect(response.status).toBe(403);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("returns 401 when no token is provided", async () => {
    const response = await request(app).get("/audit-log");

    expect(response.status).toBe(401);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("returns 500 when the query fails", async () => {
    (pool.query as any).mockRejectedValueOnce(new Error("DB down"));

    const response = await request(app)
      .get("/audit-log")
      .set("Authorization", staffAuth);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });
});
