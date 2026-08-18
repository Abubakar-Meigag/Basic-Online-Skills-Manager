import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";
import pool from "../data/connection";
import { OrganizationType } from "../data/dataType";

vi.mock("../data/connection", () => ({
  default: { query: vi.fn() },
}));

process.env.JWT_SECRET = "test-secret";

const staffToken = jwt.sign(
  {
    id: "user-1",
    email: "staff@codeyourfuture.io",
    orgType: OrganizationType.CYF_STAFF,
  },
  process.env.JWT_SECRET,
  { algorithm: "HS256", expiresIn: "1h" },
);

describe("PATCH /users/:id/status", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("successfully updates a user's status and returns 200", async () => {
    // Mock the result of the UPDATE ... RETURNING query
    (pool.query as any).mockResolvedValueOnce({ rowCount: 1 });

    const response = await request(app)
      .patch("/users/u-123/status")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ is_active: false });

    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/success/i);

    // Verify the SQL parameters
    const [query, params] = (pool.query as any).mock.calls[0];
    expect(params).toEqual([false, "u-123"]);
  });

  it("returns 404 when the user ID does not exist", async () => {
    // rowCount 0 means the UPDATE query didn't find any row to change
    (pool.query as any).mockResolvedValueOnce({ rowCount: 0 });

    const response = await request(app)
      .patch("/users/fake-id/status")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ is_active: false });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("User not found");
  });

  it("returns 500 when database update fails", async () => {
    (pool.query as any).mockRejectedValueOnce(new Error("Connection lost"));

    const response = await request(app)
      .patch("/users/u-123/status")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ is_active: true });

    expect(response.status).toBe(500);
  });
});
