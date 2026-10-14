import request from "supertest";
import app from "../app";
import pool from "../data/connection";
import jwt from "jsonwebtoken";


vi.mock("../data/connection", () => ({
  default: { connect: vi.fn() },
}));

const JWT_SECRET = "test-secret";

const tokenFor = (user: object) =>
  `Bearer ${jwt.sign(user, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "1h",
  })}`;

const makeClient = () => ({
  query: vi.fn(),
  release: vi.fn(),
});

// Answers each client.query by matching its SQL text, and throws "Unexpected query" for any query not listed.
const mockQueries = (
  client: { query: any },
  responses: Record<string, unknown>,
) => {
  client.query.mockImplementation(async (sql: string) => {
    const key = Object.keys(responses).find((k) => sql.includes(k));
    if (key === undefined) throw new Error(`Unexpected query: ${sql}`);
    const result = responses[key];
    if (result instanceof Error) throw result;
    return result;
  });
};

const cyfUser = {
  id: "staff-1",
  email: "admin@codeyourfuture.io",
  orgType: "cyf_staff",
  organisationId: "9e27629b-5911-4858-b453-14a5d227afc6",
};

const commercialUser = {
  id: "u2",
  email: "partner@example.org",
  orgType: "commercial",
  organisationId: "60ea2b0f-e04e-4f9a-ac72-38bae06d98bc",
};

describe("PATCH /course/:id/status", () => {

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("updates the status and returns 200", async () => {
    const client = makeClient();
    (pool.connect as any).mockResolvedValueOnce(client);

    mockQueries(client, {
      BEGIN: undefined,
      "SELECT id FROM courses": { rows: [{ id: "course-1" }] }, // course exists
      "UPDATE courses": { rows: [{ id: "course-1", status: "request_open" }] },
      "INSERT INTO audit_log": undefined,
      COMMIT: undefined,
    });

    const response = await request(app)
      .patch("/course/course-1/status")
      .set("Authorization", tokenFor(cyfUser))
      .send({ status: "request_open" });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("request_open");
    expect(client.query).toHaveBeenCalledWith("COMMIT");
    expect(client.release).toHaveBeenCalled();
  });

  it("returns 403 when the caller is not CYF staff", async () => {

    const response = await request(app)
      .patch("/course/course-1/status")
      .set("Authorization", tokenFor(commercialUser))
      .send({ status: "request_open" });

    expect(response.status).toBe(403);
    expect(pool.connect).not.toHaveBeenCalled();
  });

  it("returns 400 when status is missing", async () => {
    const response = await request(app)
      .patch("/course/course-1/status")
      .set("Authorization", tokenFor(cyfUser))
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(pool.connect).not.toHaveBeenCalled();
  });

  it("returns 400 for a status outside the allowed CYF transitions", async () => {
    const response = await request(app)
      .patch("/course/course-1/status")
      .set("Authorization", tokenFor(cyfUser))
      .send({ status: "request_cancelled" }); // out of scope, not allowed here

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(pool.connect).not.toHaveBeenCalled();
  });

  it("returns 400 for request_pending / request_claimed (not CYF actions)", async () => {
    const response = await request(app)
      .patch("/course/course-1/status")
      .set("Authorization", tokenFor(cyfUser))
      .send({ status: "request_claimed" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(pool.connect).not.toHaveBeenCalled();
  });

  it("returns 404 when the course does not exist", async () => {
    const client = makeClient();
    (pool.connect as any).mockResolvedValueOnce(client);

    mockQueries(client, {
      BEGIN: undefined,
      "SELECT id FROM courses": { rows: [] }, // course not found
      ROLLBACK: undefined,
    });

    const response = await request(app)
      .patch("/course/missing/status")
      .set("Authorization", tokenFor(cyfUser))
      .send({ status: "request_open" });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
    expect(client.query).toHaveBeenCalledWith("ROLLBACK");
    expect(client.release).toHaveBeenCalled();
  });

  it("writes an audit entry with the acting user and course id", async () => {
    const client = makeClient();
    (pool.connect as any).mockResolvedValueOnce(client);

    mockQueries(client, {
      BEGIN: undefined,
      "SELECT id FROM courses": { rows: [{ id: "course-1" }] }, // exists
      "UPDATE courses": { rows: [{ id: "course-1", status: "course_running" }] },
      "INSERT INTO audit_log": undefined,
      COMMIT: undefined,
    });

    await request(app)
      .patch("/course/course-1/status")
      .set("Authorization", tokenFor(cyfUser))
      .send({ status: "course_running" });

    const auditCall = client.query.mock.calls.find(
      (c: any[]) =>
        typeof c[0] === "string" && c[0].includes("INSERT INTO audit_log"),
    );

    expect(auditCall).toBeDefined();
    expect(auditCall![1]).toEqual([
      "staff-1",
      "course.status_changed",
      "course",
      "course-1",
    ]);
  });

  it("returns 500 and releases the client when a query fails", async () => {
    const client = makeClient();
    (pool.connect as any).mockResolvedValueOnce(client);

    mockQueries(client, {
      BEGIN: undefined,
      "SELECT id FROM courses": new Error("DB down"), // existence check throws
      ROLLBACK: undefined, // the catch block rolls back
    });

    const response = await request(app)
      .patch("/course/course-1/status")
      .set("Authorization", tokenFor(cyfUser))
      .send({ status: "request_open" });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
    expect(client.query).toHaveBeenCalledWith("ROLLBACK");
    expect(client.release).toHaveBeenCalled();
  });
});