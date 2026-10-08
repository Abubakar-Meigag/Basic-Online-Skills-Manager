import request from "supertest";
import app from "../app";
import pool from "../data/connection";
import jwt from "jsonwebtoken";

vi.mock("../data/connection", () => ({
  default: { query: vi.fn() },
}));

process.env.JWT_SECRET = "test-secret";

const tokenFor = (user: object) =>
  `Bearer ${jwt.sign(user, process.env.JWT_SECRET!, { algorithm: "HS256", expiresIn: "1h" })}`;

const cyfUser = {
  id: "staff-1",
  email: "admin@codeyourfuture.io",
  orgType: "cyf_staff",
  organisationId: "9e27629b-5911-4858-b453-14a5d227afc6",
};

describe("GET /organisations", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns an empty array when there are no organisations", async () => {
    (pool.query as any).mockResolvedValueOnce({ rows: [] });
    const response = await request(app)
      .get("/organisations")
      .set("Authorization", tokenFor(cyfUser));
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("returns organisations as a flat array", async () => {
    const mockRows = [
      { id: "1", organisation_name: "Capgemini", type: "commercial" },
      { id: "2", organisation_name: "New Beginnings", type: "outreach" },
    ];
    (pool.query as any).mockResolvedValueOnce({ rows: mockRows });
    const response = await request(app)
      .get("/organisations")
      .set("Authorization", tokenFor(cyfUser));
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockRows);
  });

  it("includes id, organisation_name and type on each item", async () => {
    const mockRows = [
      { id: "1", organisation_name: "Capgemini", type: "commercial" },
    ];
    (pool.query as any).mockResolvedValueOnce({ rows: mockRows });
    const response = await request(app)
      .get("/organisations")
      .set("Authorization", tokenFor(cyfUser));
    expect(response.status).toBe(200);
    expect(response.body[0]).toHaveProperty("id");
    expect(response.body[0]).toHaveProperty("organisation_name");
    expect(response.body[0]).toHaveProperty("type");
  });

  it("returns JSON content-type", async () => {
    (pool.query as any).mockResolvedValueOnce({ rows: [] });
    const response = await request(app)
      .get("/organisations")
      .set("Authorization", tokenFor(cyfUser));
    expect(response.headers["content-type"]).toMatch(/application\/json/);
  });

  it("returns 500 when the query fails", async () => {
    (pool.query as any).mockRejectedValueOnce(new Error("DB down"));
    const response = await request(app)
      .get("/organisations")
      .set("Authorization", tokenFor(cyfUser));
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });
});
