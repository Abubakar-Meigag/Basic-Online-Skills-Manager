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

describe("POST /addPartner", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("creates an organisation and first user, returns 201", async () => {
    const client = makeClient();
    (pool.connect as any).mockResolvedValueOnce(client);

    client.query
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: "org-1",
            organisation_name: "Deloitte",
            type: "commercial",
            email_domain: "deloitte.com",
            created_at: "2026-08-06T00:00:00.000Z",
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: "user-1",
            email: "contact@deloitte.com",
            organisation_id: "org-1",
          },
        ],
      })
      .mockResolvedValueOnce(undefined);

        const response = await request(app).post("/addPartner").send({
      organisation_name: "Deloitte",
      type: "commercial",
      email_domain: "deloitte.com",
      email: "contact@deloitte.com",
    });

    expect(response.status).toBe(201);
    expect(response.body.organisation.organisation_name).toBe("Deloitte");
    expect(response.body.user.email).toBe("contact@deloitte.com");
    expect(client.release).toHaveBeenCalled();
  });

  it("returns 400 when a required field is missing", async () => {
        const response = await request(app).post("/addPartner").send({
      organisation_name: "Deloitte",
      type: "commercial",
      email_domain: "deloitte.com",
      // email missing
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    // never opened a connection for a malformed request
    expect(pool.connect).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid type", async () => {
        const response = await request(app).post("/addPartner").send({
      organisation_name: "Deloitte",
      type: "cyf_staff",
      email_domain: "deloitte.com",
      email: "contact@deloitte.com",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(pool.connect).not.toHaveBeenCalled();
  });

  it("returns 409 when the organisation name or email_domain already exists", async () => {
    const client = makeClient();
    (pool.connect as any).mockResolvedValueOnce(client);

    client.query
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: "existing-org" }] }) // org exists
      .mockResolvedValueOnce(undefined); // ROLLBACK

        const response = await request(app).post("/addPartner").send({
      organisation_name: "Capgemini",
      type: "commercial",
      email_domain: "capgemini.com",
      email: "new@capgemini.com",
    });

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("error");
    expect(client.release).toHaveBeenCalled();
  });

  it("returns 409 when the email already exists", async () => {
    const client = makeClient();
    (pool.connect as any).mockResolvedValueOnce(client);

    client.query
      .mockResolvedValueOnce(undefined) 
      .mockResolvedValueOnce({ rows: [] }) 
      .mockResolvedValueOnce({ rows: [{ id: "existing-user" }] })
      .mockResolvedValueOnce(undefined); 

        const response = await request(app).post("/addPartner").send({
      organisation_name: "Deloitte",
      type: "commercial",
      email_domain: "deloitte.com",
      email: "taken@deloitte.com",
    });

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("error");
    expect(client.release).toHaveBeenCalled();
  });

  it("returns 500 and releases the client when a query fails", async () => {
    const client = makeClient();
    (pool.connect as any).mockResolvedValueOnce(client);

    client.query
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockRejectedValueOnce(new Error("DB down")); // org check throws

        const response = await request(app).post("/addPartner").send({
      organisation_name: "Deloitte",
      type: "commercial",
      email_domain: "deloitte.com",
      email: "contact@deloitte.com",
    });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
    expect(client.release).toHaveBeenCalled();
  });
});
