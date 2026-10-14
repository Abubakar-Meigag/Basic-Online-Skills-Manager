import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";
import pool from "../data/connection";
import { OrganizationType } from "../data/dataType";

vi.mock("../data/connection", () => ({
  default: { connect: vi.fn() },
}));


const JWT_SECRET = "test-secret"; 

// A valid CYF-staff token
const staffToken = jwt.sign(
  {
    id: "staff-1",
    email: "staff@codeyourfuture.io",
    orgType: OrganizationType.CYF_STAFF,
    organisationId: "cyf-org",
  },
  JWT_SECRET,
  { algorithm: "HS256", expiresIn: "1h" },
);

const auth = `Bearer ${staffToken}`;

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

// The normal successful sequence of queries for adding a user.
const Path = (newUser: Record<string, unknown>, orgId: string) => ({
  BEGIN: undefined,
  "SELECT id FROM organisations": { rows: [{ id: orgId }] }, // org exists
  "SELECT id FROM users": { rows: [] }, // email not taken
  "INSERT INTO users": { rows: [newUser] },
  "INSERT INTO audit_log": undefined,
  COMMIT: undefined,
});

describe("POST /partners/:id/users", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("creates a user linked to the org and returns 201", async () => {
    const client = makeClient();
    (pool.connect as any).mockResolvedValueOnce(client);

    mockQueries(
      client,
      Path(
        {
          id: "user-1",
          email: "second@capgemini.com",
          organisation_id: "org-1",
        },
        "org-1",
      ),
    );

    const response = await request(app)
      .post("/partners/org-1/users")
      .set("Authorization", auth)
      .send({ email: "second@capgemini.com" });

    expect(response.status).toBe(201);
    expect(response.body.email).toBe("second@capgemini.com");
    expect(response.body.organisation_id).toBe("org-1");
    expect(client.query).toHaveBeenCalledWith("COMMIT");
    expect(client.release).toHaveBeenCalled();
  });

  it("links the user to the org id from the path, not the body", async () => {
    const client = makeClient();
    (pool.connect as any).mockResolvedValueOnce(client);

    mockQueries(
      client,
      Path(
        {
          id: "user-1",
          email: "new@capgemini.com",
          organisation_id: "org-from-path",
        },
        "org-from-path",
      ),
    ); // here

    const response = await request(app)
      .post("/partners/org-from-path/users")
      .set("Authorization", auth)
      .send({ email: "new@capgemini.com", organisation_id: "attacker-org" });

    expect(response.status).toBe(201);
    expect(response.body.organisation_id).toBe("org-from-path");

    const insertCall = client.query.mock.calls.find(
      (c: any[]) =>
        typeof c[0] === "string" && c[0].includes("INSERT INTO users"),
    );
    expect(insertCall).toBeDefined();
    expect(insertCall![1]).toEqual(["new@capgemini.com", "org-from-path"]);
  });

  it("returns 400 when email is missing", async () => {
    const response = await request(app)
      .post("/partners/org-1/users")
      .set("Authorization", auth)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(pool.connect).not.toHaveBeenCalled();
  });

  it("returns 400 when email is malformed", async () => {
    const response = await request(app)
      .post("/partners/org-1/users")
      .set("Authorization", auth)
      .send({ email: "not-an-email" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(pool.connect).not.toHaveBeenCalled();
  });

  it("returns 404 when the organisation does not exist", async () => {
    const client = makeClient();
    (pool.connect as any).mockResolvedValueOnce(client);

    mockQueries(client, {
      BEGIN: undefined,
      "SELECT id FROM organisations": { rows: [] }, // org not found
      ROLLBACK: undefined,
    });

    const response = await request(app)
      .post("/partners/missing-org/users")
      .set("Authorization", auth)
      .send({ email: "someone@example.com" });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
    expect(client.query).toHaveBeenCalledWith("ROLLBACK");
    expect(client.release).toHaveBeenCalled();
  });

  it("returns 409 when the email already exists", async () => {
    const client = makeClient();
    (pool.connect as any).mockResolvedValueOnce(client);

    mockQueries(client, {
      BEGIN: undefined,
      "SELECT id FROM organisations": { rows: [{ id: "org-1" }] }, // org exists
      "SELECT id FROM users": { rows: [{ id: "existing-user" }] }, // email taken
      ROLLBACK: undefined,
    });

    const response = await request(app)
      .post("/partners/org-1/users")
      .set("Authorization", auth)
      .send({ email: "taken@capgemini.com" });

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("error");
    expect(client.query).toHaveBeenCalledWith("ROLLBACK");
    expect(client.release).toHaveBeenCalled();
  });

  it("returns 500 and releases the client when a query fails", async () => {
    const client = makeClient();
    (pool.connect as any).mockResolvedValueOnce(client);

    mockQueries(client, {
      BEGIN: undefined,
      "SELECT id FROM organisations": new Error("DB down"), // org check throws
      ROLLBACK: undefined, // the catch block rolls back
    });

    const response = await request(app)
      .post("/partners/org-1/users")
      .set("Authorization", auth)
      .send({ email: "someone@example.com" });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
    expect(client.release).toHaveBeenCalled();
  });

  it("returns 401 when no token is provided", async () => {
    const response = await request(app)
      .post("/partners/org-1/users")
      .send({ email: "someone@example.com" });

    expect(response.status).toBe(401);
    expect(pool.connect).not.toHaveBeenCalled();
  });
});