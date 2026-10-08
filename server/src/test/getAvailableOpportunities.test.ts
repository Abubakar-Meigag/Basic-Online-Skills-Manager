import request from "supertest";
import app from "../app";
import pool from "../data/connection";
import jwt from "jsonwebtoken";
import { OrganizationType } from "../data/dataType";

vi.mock("../data/connection", () => ({
  default: { query: vi.fn() },
}));

process.env.JWT_SECRET = "test-secret";

const tokenFor = (user: object) =>
  `Bearer ${jwt.sign(user, process.env.JWT_SECRET!, { algorithm: "HS256", expiresIn: "1h" })}`;

const outreachUser = {
  id: "user-123",
  email: "partner@example.com",
  orgType: OrganizationType.OUTREACH_PARTNER,
  organisationId: "org-outreach-99",
};

const getOpportunities = () =>
  request(app).get("/opportunities").set("Authorization", tokenFor(outreachUser));


describe("GET /opportunities", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns an empty array when there are no open opportunities", async () => {
    (pool.query as any).mockResolvedValueOnce({ rows: [] });
    const response = await getOpportunities();
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("returns open opportunities as a flat array", async () => {
    const mockRows = [
      {
        id: "1",
        city: "Newcastle",
        trainee_target: 15,
        deadline: "2026-09-30",
        status: "request_open",
        commercial_org: "Capgemini",
      },
    ];
    (pool.query as any).mockResolvedValueOnce({ rows: mockRows });
    const response = await getOpportunities();
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockRows);
  });

  it("resolves the commercial organisation name", async () => {
    const mockRows = [
      {
        id: "1",
        city: "Newcastle",
        trainee_target: 15,
        deadline: "2026-09-30",
        status: "request_open",
        commercial_org: "Capgemini",
      },
    ];
    (pool.query as any).mockResolvedValueOnce({ rows: mockRows });
    const response = await getOpportunities();
    expect(response.status).toBe(200);
    expect(response.body[0].commercial_org).toBe("Capgemini");
  });

  it("returns JSON content-type", async () => {
    (pool.query as any).mockResolvedValueOnce({ rows: [] });
    const response = await getOpportunities();
    expect(response.headers["content-type"]).toMatch(/application\/json/);
  });

  it("returns 500 when the query fails", async () => {
    (pool.query as any).mockRejectedValueOnce(new Error("DB down"));
    const response = await getOpportunities();
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });
});
