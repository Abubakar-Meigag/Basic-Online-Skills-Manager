import request from "supertest";
import app from "../app";
import pool from "../data/connection";

vi.mock("../data/connection", () => ({
  default: { query: vi.fn() },
}));

const validBody = {
  commercial_org_id: "60ea2b0f-e04e-4f9a-ac72-38bae06d98bc",
  account_name: "National Highways",
  contract_name: "DWS",
  city: "Birmingham",
  trainee_target: 12,
  deadline: "2026-09-30",
};

describe("POST /commercial/requestedNewCourses", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("creates a course request and returns 201", async () => {
    const mockCourse = {
      id: "course-1",
      commercial_org_id: "60ea2b0f-e04e-4f9a-ac72-38bae06d98bc",
      account_name: "National Highways",
      contract_name: "DWS",
      city: "Birmingham",
      trainee_target: 12,
      deadline: "2026-09-29T23:00:00.000Z",
      status: "request_pending",
    };
    (pool.query as any).mockResolvedValueOnce({ rows: [mockCourse] });

    const response = await request(app)
      .post("/commercial/requestedNewCourses")
      .send(validBody);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("request_pending");
    expect(response.body.city).toBe("Birmingham");
  });

  it("forces status to request_pending even if the body sends another status", async () => {
    const mockCourse = { id: "course-1", status: "request_pending" };
    (pool.query as any).mockResolvedValueOnce({ rows: [mockCourse] });

    const response = await request(app)
      .post("/commercial/requestedNewCourses")
      .send({ ...validBody, status: "course_completed" });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("request_pending");

    const call = (pool.query as any).mock.calls[0];
    expect(call[1]).not.toContain("course_completed");
  });

  it("uses the commercial_org_id supplied by the caller (temporary, pre-auth)", async () => {
    const mockCourse = {
      id: "course-1",
      commercial_org_id: "60ea2b0f-e04e-4f9a-ac72-38bae06d98bc",
      status: "request_pending",
    };
    (pool.query as any).mockResolvedValueOnce({ rows: [mockCourse] });

    const response = await request(app)
      .post("/commercial/requestedNewCourses")
      .send(validBody);

    expect(response.status).toBe(201);
    // The org id supplied by the caller is what reaches the query.
    // NOTE pre-auth only: once login exists this comes from the session,
    // and a body-supplied org id must be ignored update this test then.
    const call = (pool.query as any).mock.calls[0];
    expect(call[1]).toContain("60ea2b0f-e04e-4f9a-ac72-38bae06d98bc");
  });

  it("returns 400 when commercial_org_id is not supplied", async () => {
    const { commercial_org_id, ...bodyWithoutOrg } = validBody;
    const response = await request(app)
      .post("/commercial/requestedNewCourses")
      .send(bodyWithoutOrg);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("returns 400 when a required field is missing", async () => {
    const response = await request(app)
      .post("/commercial/requestedNewCourses")
      .send({
        commercial_org_id: "60ea2b0f-e04e-4f9a-ac72-38bae06d98bc",
        account_name: "National Highways",
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("returns 400 when trainee_target is zero or negative", async () => {
    const response = await request(app)
      .post("/commercial/requestedNewCourses")
      .send({ ...validBody, trainee_target: 0 });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("returns 400 when trainee_target is not an integer", async () => {
    const response = await request(app)
      .post("/commercial/requestedNewCourses")
      .send({ ...validBody, trainee_target: 3.5 });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("returns JSON content-type", async () => {
    (pool.query as any).mockResolvedValueOnce({ rows: [{ id: "1" }] });
    const response = await request(app)
      .post("/commercial/requestedNewCourses")
      .send(validBody);
    expect(response.headers["content-type"]).toMatch(/application\/json/);
  });

  it("returns 500 when the query fails", async () => {
    (pool.query as any).mockRejectedValueOnce(new Error("DB down"));
    const response = await request(app)
      .post("/commercial/requestedNewCourses")
      .send(validBody);
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });
});
