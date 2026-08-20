import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";
import { OrganizationType } from "../data/dataType";

const mockClient = {
  query: vi.fn(),
  release: vi.fn(),
};

vi.mock("../data/connection", () => ({
  default: {
    connect: vi.fn(() => Promise.resolve(mockClient)),
    query: vi.fn(),
  },
}));

process.env.JWT_SECRET = "test-secret";

const staffToken = jwt.sign(
  {
    id: "staff-999",
    email: "staff@codeyourfuture.io",
    orgType: OrganizationType.CYF_STAFF,
  },
  process.env.JWT_SECRET,
  { algorithm: "HS256", expiresIn: "1h" },
);

describe("PATCH /users/:id/status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully updates user status and inserts audit log", async () => {
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: "u-123" }] }) // UPDATE
      .mockResolvedValueOnce({}) // INSERT (audit log)
      .mockResolvedValueOnce({}); // COMMIT

    const response = await request(app)
      .patch("/users/u-123/status")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ is_active: false });

    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/logged successfully/i);

    const auditLogParams = mockClient.query.mock.calls[2]![1];

    expect(auditLogParams[0]).toBe("staff-999");

    expect(auditLogParams[1]).toMatch(/Inactive/);

    expect(auditLogParams[3]).toBe("u-123");

    expect(mockClient.release).toHaveBeenCalled();
  });

  it("returns 404 and rolls back if user does not exist", async () => {
    mockClient.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rowCount: 0 });

    const response = await request(app)
      .patch("/users/fake-id/status")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ is_active: false });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("User not found");

    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });

  it("returns 500 and rolls back on database error", async () => {
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockRejectedValueOnce(new Error("Connection lost")); // UPDATE CRASHES

    const response = await request(app)
      .patch("/users/u-123/status")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ is_active: true });

    expect(response.status).toBe(500);
    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });

  it("returns 401 when the performer ID is missing from the token", async () => {
    const malformedToken = jwt.sign(
      {
        email: "staff@codeyourfuture.io",
        orgType: OrganizationType.CYF_STAFF,
      },
      process.env.JWT_SECRET as string,
      { algorithm: "HS256" },
    );

    const response = await request(app)
      .patch("/users/u-123/status")
      .set("Authorization", `Bearer ${malformedToken}`)
      .send({ is_active: false });

    expect(response.status).toBe(401);
    expect(response.body.error).toMatch(/No performer ID found/i);
  });

  it("successfully updates a user's status to ACTIVE and returns 200", async () => {
    mockClient.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce({});

    const response = await request(app)
      .patch("/users/u-123/status")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ is_active: true });

    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/logged successfully/i);

    expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
    expect(mockClient.release).toHaveBeenCalled();
  });
});
