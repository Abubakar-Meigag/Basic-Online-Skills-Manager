import request from "supertest";
import app from "../app";
import pool from "../data/connection";

vi.mock("../data/connection", () => ({
  default: { connect: vi.fn() },
}));

const makeClient = () => ({
  query: vi.fn(),
  release: vi.fn(),
});

describe("POST /partners/:id/users", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("creates a user linked to the org and returns 201", async () => {
    const client = makeClient();
    (pool.connect as any).mockResolvedValueOnce(client);

    client.query
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: "org-1" }] }) // org exists
      .mockResolvedValueOnce({ rows: [] }) // email not taken
      .mockResolvedValueOnce({
        rows: [
          {
            id: "user-1",
            email: "second@capgemini.com",
            organisation_id: "org-1",
          },
        ],
      })
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined);

    const response = await request(app)
      .post("/partners/org-1/users")
      .send({ email: "second@capgemini.com" });

    expect(response.status).toBe(201);
    expect(response.body.email).toBe("second@capgemini.com");
    expect(response.body.organisation_id).toBe("org-1");
    expect(client.release).toHaveBeenCalled();
  });

  it("links the user to the org id from the path, not the body", async () => {
    const client = makeClient();
    (pool.connect as any).mockResolvedValueOnce(client);

    client.query
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ rows: [{ id: "org-from-path" }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: "user-1",
            email: "new@capgemini.com",
            organisation_id: "org-from-path",
          },
        ],
      })
      .mockResolvedValueOnce(undefined) // audit_log
      .mockResolvedValueOnce(undefined);

    // Body tries to smuggle a different organisation_id - must be ignored
    const response = await request(app)
      .post("/partners/org-from-path/users")
      .send({ email: "new@capgemini.com", organisation_id: "attacker-org" });

    expect(response.status).toBe(201);
    expect(response.body.organisation_id).toBe("org-from-path");

    // Confirm the INSERT used the path id, not the body id
    const insertCall = client.query.mock.calls.find(
      (c: any[]) =>
        typeof c[0] === "string" && c[0].includes("INSERT INTO users"),
    );
    expect(insertCall).toBeDefined();
    expect(insertCall![1]).toEqual(["new@capgemini.com", "org-from-path"]);
  });

  it("returns 400 when email is missing", async () => {
    const response = await request(app).post("/partners/org-1/users").send({});
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(pool.connect).not.toHaveBeenCalled();
  });

  it("returns 400 when email is malformed", async () => {
    const response = await request(app)
      .post("/partners/org-1/users")
      .send({ email: "not-an-email" });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(pool.connect).not.toHaveBeenCalled();
  });

  it("returns 404 when the organisation does not exist", async () => {
    const client = makeClient();
    (pool.connect as any).mockResolvedValueOnce(client);

    client.query
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockResolvedValueOnce({ rows: [] }) // org not found
      .mockResolvedValueOnce(undefined); // ROLLBACK

    const response = await request(app)
      .post("/partners/missing-org/users")
      .send({ email: "someone@example.com" });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
    expect(client.release).toHaveBeenCalled();
  });

  it("returns 409 when the email already exists", async () => {
    const client = makeClient();
    (pool.connect as any).mockResolvedValueOnce(client);

    client.query
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: "org-1" }] }) // org exists
      .mockResolvedValueOnce({ rows: [{ id: "existing-user" }] }) // email taken
      .mockResolvedValueOnce(undefined); // ROLLBACK

    const response = await request(app)
      .post("/partners/org-1/users")
      .send({ email: "taken@capgemini.com" });

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("error");
    expect(client.release).toHaveBeenCalled();
  });

  it("returns 500 and releases the client when a query fails", async () => {
    const client = makeClient();
    (pool.connect as any).mockResolvedValueOnce(client);

    client.query
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockRejectedValueOnce(new Error("DB down"));

    const response = await request(app)
      .post("/partners/org-1/users")
      .send({ email: "someone@example.com" });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
    expect(client.release).toHaveBeenCalled();
  });
});
