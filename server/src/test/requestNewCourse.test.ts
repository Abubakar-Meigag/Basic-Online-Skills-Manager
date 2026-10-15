import request from "supertest";
import app from "../app";
import pool from "../data/connection";
import jwt from "jsonwebtoken";
import { withMockedQueries } from "./helpers/mockQueries";

vi.mock("../data/connection", () => ({
  default: { connect: vi.fn() },
}));

const JWT_SECRET = "test-secret";

const tokenFor = (user: object) =>
  `Bearer ${jwt.sign(user, JWT_SECRET, { algorithm: "HS256", expiresIn: "1h" })}`;

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

// The normal successful sequence of queries for requesting a course.
const Path = (course: Record<string, unknown>) => ({ // (replaces mockSuccessfulClient)
  BEGIN: undefined,
  "INSERT INTO courses": { rows: [course] },
  "INSERT INTO audit_log": undefined,
  COMMIT: undefined,
});

describe("POST /commercial/requestedNewCourses", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("creates a course request and returns 201", async () => {
    const client = makeClient();
    (pool.connect as any).mockResolvedValueOnce(client);

    const response = await withMockedQueries(
      client,
      Path({
        id: "course-1",
        commercial_org_id: commercialUser.organisationId,
        city: "Birmingham",
        status: "request_pending",
      }),
      async () =>
        request(app)
          .post("/commercial/requestedNewCourses")
          .set("Authorization", tokenFor(commercialUser))
          .send(validBody),
    );

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("request_pending");
    expect(response.body.city).toBe("Birmingham");
    expect(client.release).toHaveBeenCalled();
  });

  it("forces status to request_pending even if the body sends another status", async () => {
    const client = makeClient();
    (pool.connect as any).mockResolvedValueOnce(client);

    const response = await withMockedQueries(
      client,
      Path({ id: "course-1", status: "request_pending" }),
      async () =>
        request(app)
          .post("/commercial/requestedNewCourses")
          .set("Authorization", tokenFor(commercialUser))
          .send({ ...validBody, status: "course_completed" }),
    );

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
    const client = makeClient();
    (pool.connect as any).mockResolvedValueOnce(client);

    await withMockedQueries(
      client,
      Path({ id: "course-1" }),
      async () =>
        request(app)
          .post("/commercial/requestedNewCourses")
          .set("Authorization", tokenFor(commercialUser))
          .send({ ...validBody, commercial_org_id: "some-other-org" }),
    );

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
    const client = makeClient();
    (pool.connect as any).mockResolvedValueOnce(client);

    const response = await withMockedQueries(
      client,
      Path({ id: "1" }),
      async () =>
        request(app)
          .post("/commercial/requestedNewCourses")
          .set("Authorization", tokenFor(commercialUser))
          .send(validBody),
    );

    expect(response.headers["content-type"]).toMatch(/application\/json/);
  });

  it("returns 500 and releases the client when the query fails", async () => {
    const client = makeClient();
    (pool.connect as any).mockResolvedValueOnce(client);

    const response = await withMockedQueries(
      client,
      {
        BEGIN: undefined,
        "INSERT INTO courses": new Error("DB down"), // INSERT throws
        ROLLBACK: undefined, // the catch block rolls back
      },
      async () =>
        request(app)
          .post("/commercial/requestedNewCourses")
          .set("Authorization", tokenFor(commercialUser))
          .send(validBody),
    );

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
    expect(client.release).toHaveBeenCalled();
  });
});