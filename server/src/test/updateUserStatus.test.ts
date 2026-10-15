import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";
import pool from "../data/connection";
import { OrganizationType } from "../data/dataType";
import { withMockedQueries } from "./helpers/mockQueries";

vi.mock("../data/connection", () => ({
  default: { connect: vi.fn() },
}));

const JWT_SECRET = "test-secret";

const makeClient = () => ({
  query: vi.fn(),
  release: vi.fn(),
});

const staffToken = jwt.sign(
  {
    id: "staff-999",
    email: "staff@codeyourfuture.io",
    orgType: OrganizationType.CYF_STAFF,
  },
  JWT_SECRET,
  { algorithm: "HS256", expiresIn: "1h" },
);

describe("PATCH /users/:id/status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully updates user status and inserts audit log", async () => {
    const client = makeClient();
    (pool.connect as any).mockResolvedValueOnce(client);

    const response = await withMockedQueries(
      client,
      {
        BEGIN: {},
        "UPDATE users": { rowCount: 1, rows: [{ id: "u-123" }] },
        "INSERT INTO audit_log": {},
        COMMIT: {},
      },
      async () =>
        request(app)
          .patch("/users/u-123/status")
          .set("Authorization", `Bearer ${staffToken}`)
          .send({ is_active: false }),
    );

    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/logged successfully/i);

    // find the audit INSERT by its SQL instead of mock.calls[2], which depended on call order
    const auditCall = client.query.mock.calls.find((c: any[]) =>
      String(c[0]).includes("INSERT INTO audit_log"),
    );
    expect(auditCall).toBeDefined();
    const auditLogParams = auditCall![1];

    expect(auditLogParams[0]).toBe("staff-999");
    expect(auditLogParams[1]).toMatch(/Inactive/);
    expect(auditLogParams[3]).toBe("u-123");

    expect(client.release).toHaveBeenCalled();
  });

  it("returns 404 and rolls back if user does not exist", async () => {
    const client = makeClient();
    (pool.connect as any).mockResolvedValueOnce(client);

    const response = await withMockedQueries(
      client,
      {
        BEGIN: {},
        "UPDATE users": { rowCount: 0 }, // no user matched
        ROLLBACK: {},
      },
      async () =>
        request(app)
          .patch("/users/fake-id/status")
          .set("Authorization", `Bearer ${staffToken}`)
          .send({ is_active: false }),
    );

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("User not found");
    expect(client.release).toHaveBeenCalled();
  });

  it("returns 500 and rolls back on database error", async () => {
    const client = makeClient();
    (pool.connect as any).mockResolvedValueOnce(client);

    const response = await withMockedQueries(
      client,
      {
        BEGIN: {},
        "UPDATE users": new Error("Connection lost"), // UPDATE crashes
        ROLLBACK: {}, // the catch block rolls back
      },
      async () =>
        request(app)
          .patch("/users/u-123/status")
          .set("Authorization", `Bearer ${staffToken}`)
          .send({ is_active: true }),
    );

    expect(response.status).toBe(500);
    expect(client.release).toHaveBeenCalled();
  });

  it("returns 401 when the performer ID is missing from the token", async () => {
    const malformedToken = jwt.sign(
      {
        email: "staff@codeyourfuture.io",
        orgType: OrganizationType.CYF_STAFF,
      },
      JWT_SECRET as string,
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
    const client = makeClient();
    (pool.connect as any).mockResolvedValueOnce(client);

    const response = await withMockedQueries(
      client,
      {
        BEGIN: {},
        "UPDATE users": { rowCount: 1 },
        "INSERT INTO audit_log": { rowCount: 1 },
        COMMIT: {},
      },
      async () =>
        request(app)
          .patch("/users/u-123/status")
          .set("Authorization", `Bearer ${staffToken}`)
          .send({ is_active: true }),
    );

    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/logged successfully/i);
    expect(client.release).toHaveBeenCalled();
  });
});
