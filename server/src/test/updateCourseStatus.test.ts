import request from "supertest";
import app from "../app";
import pool from "../data/connection";

// Auth is handled by mocking the auth middleware (per tech lead): same `app`,
// but the middleware is replaced so it injects a controllable req.user.
//
// >>> CHANGE THIS to match the real middleware once it's merged: <<<
//   - the module path in vi.mock(...)      ("../middleware/requireAuth")
//   - the exported function name           (requireAuth)
//   - if a separate role guard exists (e.g. requireRole), mock it too.
//   - confirm the field name is `orgType` (what our JWT signs), not
//     `organization_type` — mockUser and the handler both use orgType.

vi.mock("../data/connection", () => ({
  default: { connect: vi.fn() },
}));

// The user the mocked middleware puts on req.user. Each test sets this.
let mockUser: Record<string, unknown> | null = null;

vi.mock("../api/middleware/requireAuth", () => ({
  requireAuth: (req: any, _res: any, next: any) => {
    req.user = mockUser;
    next();
  },
}));

const makeClient = () => ({
  query: vi.fn(),
  release: vi.fn(),
});

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
  beforeEach(() => {
    // Default: an authorised CYF staff user. Individual tests override.
    mockUser = cyfUser;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("updates the status and returns 200", async () => {
    const client = makeClient();
    (pool.connect as any).mockResolvedValueOnce(client);

    client.query
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: "course-1" }] }) // course exists
      .mockResolvedValueOnce({
        rows: [{ id: "course-1", status: "request_open" }],
      }) // UPDATE ... RETURNING
      .mockResolvedValueOnce(undefined) // audit insert
      .mockResolvedValueOnce(undefined); // COMMIT

    const response = await request(app)
      .patch("/course/course-1/status")
      .send({ status: "request_open" });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("request_open");
    expect(client.release).toHaveBeenCalled();
  });

  it("returns 403 when the caller is not CYF staff", async () => {
    mockUser = commercialUser;

    const response = await request(app)
      .patch("/course/course-1/status")
      .send({ status: "request_open" });

    expect(response.status).toBe(403);
    expect(pool.connect).not.toHaveBeenCalled();
  });

  it("returns 400 when status is missing", async () => {
    const response = await request(app)
      .patch("/course/course-1/status")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(pool.connect).not.toHaveBeenCalled();
  });

  it("returns 400 for a status outside the allowed CYF transitions", async () => {
    const response = await request(app)
      .patch("/course/course-1/status")
      .send({ status: "request_cancelled" }); // out of scope, not allowed here

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(pool.connect).not.toHaveBeenCalled();
  });

  it("returns 400 for request_pending / request_claimed (not CYF actions)", async () => {
    const response = await request(app)
      .patch("/course/course-1/status")
      .send({ status: "request_claimed" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(pool.connect).not.toHaveBeenCalled();
  });

  it("returns 404 when the course does not exist", async () => {
    const client = makeClient();
    (pool.connect as any).mockResolvedValueOnce(client);

    client.query
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockResolvedValueOnce({ rows: [] }) // course not found
      .mockResolvedValueOnce(undefined); // ROLLBACK

    const response = await request(app)
      .patch("/course/missing/status")
      .send({ status: "request_open" });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
    expect(client.release).toHaveBeenCalled();
  });

  it("writes an audit entry with the acting user and course id", async () => {
    const client = makeClient();
    (pool.connect as any).mockResolvedValueOnce(client);

    client.query
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: "course-1" }] }) // exists
      .mockResolvedValueOnce({
        rows: [{ id: "course-1", status: "course_running" }],
      }) // UPDATE
      .mockResolvedValueOnce(undefined) // audit
      .mockResolvedValueOnce(undefined); // COMMIT

    await request(app)
      .patch("/course/course-1/status")
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

    client.query
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockRejectedValueOnce(new Error("DB down")); // existence check throws

    const response = await request(app)
      .patch("/course/course-1/status")
      .send({ status: "request_open" });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
    expect(client.release).toHaveBeenCalled();
  });
});
