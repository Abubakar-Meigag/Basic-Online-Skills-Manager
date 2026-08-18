import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";
import pool from "../data/connection";
import { OrganizationType } from "../data/dataType";

// Mock the database connection
vi.mock("../data/connection", () => ({
  default: { query: vi.fn() },
}));

process.env.JWT_SECRET = "test-secret";

// A valid CYF-staff token
const staffToken = jwt.sign(
  {
    id: "user-1",
    email: "staff@codeyourfuture.io",
    orgType: OrganizationType.CYF_STAFF,
  },
  process.env.JWT_SECRET,
  { algorithm: "HS256", expiresIn: "1h" },
);

// A valid Partner token (to test authorization failure)
const partnerToken = jwt.sign(
  {
    id: "user-2",
    email: "partner@example.com",
    orgType: OrganizationType.COMMERCIAL_PARTNER,
  },
  process.env.JWT_SECRET,
  { algorithm: "HS256", expiresIn: "1h" },
);

describe("GET /users", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 and a list of users with joined organisation names", async () => {
    (pool.query as any).mockResolvedValueOnce({
      rows: [
        {
          id: "u-123",
          email: "trainee@example.com",
          organisation_name: "Deloitte",
          is_active: true,
          last_login_at: "2026-08-01T10:00:00.000Z",
        },
      ],
    });

    const response = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${staffToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0].organisation_name).toBe("Deloitte");
    expect(response.body[0].email).toBe("trainee@example.com");
  });

  it("returns 403 when accessed by a non-staff user", async () => {
    const response = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${partnerToken}`);

    expect(response.status).toBe(403);
  });

  it("returns 500 when the database query fails", async () => {
    (pool.query as any).mockRejectedValueOnce(new Error("Database error"));

    const response = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${staffToken}`);

    expect(response.status).toBe(500);
  });
});
