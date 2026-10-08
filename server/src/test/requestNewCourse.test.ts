import request from "supertest";
import app from "../app";
import pool from "../data/connection";
import jwt from "jsonwebtoken";

vi.mock("../data/connection", () => ({
  default: { connect: vi.fn() },
}));

process.env.JWT_SECRET = "test-secret";

const tokenFor = (user: object) =>
  `Bearer ${jwt.sign(user, process.env.JWT_SECRET!, { algorithm: "HS256", expiresIn: "1h" })}`;

const makeClient = () => ({ query: vi.fn(), release: vi.fn() });

const commercialUser = {
  id: "u2",
  email: "partner@example.org",
  orgType: "commercial",
  organisationId: "60ea2b0f-e04e-4f9a-ac72-38bae06d98bc",
};

const validBody = {
  account_name: "National Highways",
  contract_name: "DWS",
  city: "Birmingham",
  trainee_target: 12,
  deadline: "2026-09-30",
};

const mockSuccessfulClient = (course: Record<string, unknown>) => {
  const client = makeClient();
  (pool.connect as any).mockResolvedValueOnce(client);
  client.query
    .mockResolvedValueOnce(undefined) // BEGIN
    .mockResolvedValueOnce({ rows: [course] }) // INSERT ... RETURNING
    .mockResolvedValueOnce(undefined) // audit insert
    .mockResolvedValueOnce(undefined); // COMMIT
  return client;
};

describe("POST /commercial/requestedNewCourses", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("creates a course request and returns 201", async () => {
    const client = mockSuccessfulClient({
      id: "course-1",
      commercial_org_id: commercialUser.organisationId,
      city: "Birmingham",
      status: "request_pending",
    });

    const response = await request(app)
      .post("/commercial/requestedNewCourses")
      .set("Authorization", tokenFor(commercialUser))
      .send(validBody);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("request_pending");
    expect(response.body.city).toBe("Birmingham");
    expect(client.release).toHaveBeenCalled();
  });

  it("forces status to request_pending even if the body sends another status", async () => {
    const client = mockSuccessfulClient({ id: "course-1", status: "request_pending" });

    const response = await request(app)
      .post("/commercial/requestedNewCourses")
      .set("Authorization", tokenFor(commercialUser))
      .send({ ...validBody, status: "course_completed" });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("request_pending");

    const insertCall = client.query.mock.calls.find(
      (c: any[]) =>
        typeof c[0] === "string" && c[0].includes("INSERT INTO courses"),
    );

    expect(insertCall).toBeDefined();
    expect(insertCall![1]).not.toContain("course_completed");
  });

  it("uses the organisation from the token and ignores one in the body", async () => {
    const client = mockSuccessfulClient({ id: "course-1" });

    await request(app)
      .post("/commercial/requestedNewCourses")
      .set("Authorization", tokenFor(commercialUser))
      .send({ ...validBody, commercial_org_id: "some-other-org" });

    const insertCall = client.query.mock.calls.find(
      (c: any[]) =>
        typeof c[0] === "string" && c[0].includes("INSERT INTO courses"),
    );

    expect(insertCall).toBeDefined();
    expect(insertCall![1][0]).toBe(commercialUser.organisationId);
    expect(insertCall![1]).not.toContain("some-other-org");
  });

  it("returns 403 when the user is not linked to an organisation", async () => {
    const { organisationId, ...noOrgUser } = commercialUser;

    const response = await request(app)
      .post("/commercial/requestedNewCourses")
      .set("Authorization", tokenFor(noOrgUser))
      .send(validBody);

    expect(response.status).toBe(403);
    expect(pool.connect).not.toHaveBeenCalled();
  });

  it("returns 400 when a required field is missing", async () => {
    const response = await request(app)
      .post("/commercial/requestedNewCourses")
      .set("Authorization", tokenFor(commercialUser))
      .send({ account_name: "National Highways" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(pool.connect).not.toHaveBeenCalled();
  });

  it("returns 400 when trainee_target is zero or negative", async () => {
    const response = await request(app)
      .post("/commercial/requestedNewCourses")
      .set("Authorization", tokenFor(commercialUser))
      .send({ ...validBody, trainee_target: 0 });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(pool.connect).not.toHaveBeenCalled();
  });

  it("returns 400 when trainee_target is not an integer", async () => {
    const response = await request(app)
      .post("/commercial/requestedNewCourses")
      .set("Authorization", tokenFor(commercialUser))
      .send({ ...validBody, trainee_target: 3.5 });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(pool.connect).not.toHaveBeenCalled();
  });

  it("returns JSON content-type", async () => {
    mockSuccessfulClient({ id: "1" });

    const response = await request(app)
      .post("/commercial/requestedNewCourses")
      .set("Authorization", tokenFor(commercialUser))
      .send(validBody);

    expect(response.headers["content-type"]).toMatch(/application\/json/);
  });

  it("returns 500 and releases the client when the query fails", async () => {
    const client = makeClient();
    (pool.connect as any).mockResolvedValueOnce(client);
    client.query
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockRejectedValueOnce(new Error("DB down")); // INSERT throws

    const response = await request(app)
      .post("/commercial/requestedNewCourses")
      .set("Authorization", tokenFor(commercialUser))
      .send(validBody);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
    expect(client.release).toHaveBeenCalled();
  });
});
