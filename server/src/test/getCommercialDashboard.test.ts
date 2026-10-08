import request from "supertest";
import app from "../app";
import pool from "../data/connection";
import jwt from "jsonwebtoken";

vi.mock("../data/connection", () => ({
  default: { query: vi.fn() },
}));

process.env.JWT_SECRET = "test-secret";

const tokenFor = (user: object) =>
  `Bearer ${jwt.sign(user, process.env.JWT_SECRET!, { algorithm: "HS256", expiresIn: "1h" })}`;

const commercialUser = {
  id: "u2",
  email: "partner@example.org",
  orgType: "commercial",
  organisationId: "60ea2b0f-e04e-4f9a-ac72-38bae06d98bc",
};

const ROUTE = "/commercial-dashboard";

const getDashboard = () =>
  request(app).get(ROUTE).set("Authorization", tokenFor(commercialUser));

describe(`GET ${ROUTE}`, () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with a data array when db has rows", async () => {
    const mockRows = [
      {
        id: "course-1",
        course_name: "Basic Online Skills",
        account_name: "Capgemini",
        contract_name: "Debt",
        trainee_target: 15,
        deadline: "2026-09-30",
        city: "Blackpool",
        status: "request_pending",
        start_date: null,
        end_date: null,
        outreach_partner: null,
      },
    ];
    (pool.query as any).mockResolvedValueOnce({ rows: mockRows });

    const response = await getDashboard();

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: mockRows });
  });

  it("returns an empty data array when db is empty", async () => {
    (pool.query as any).mockResolvedValueOnce({ rows: [] });

    const response = await getDashboard();

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: [] });
  });

  it("returns multiple courses in the data array", async () => {
    const mockRows = [
      { id: "course-1", status: "request_pending", outreach_partner: null },
      {
        id: "course-2",
        status: "course_running",
        outreach_partner: "New Beginnings",
      },
    ];
    (pool.query as any).mockResolvedValueOnce({ rows: mockRows });

    const response = await getDashboard();

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data).toEqual(mockRows);
  });

  it("includes outreach_partner as null when a course is unclaimed", async () => {
    const mockRows = [
      { id: "course-1", status: "request_open", outreach_partner: null },
    ];
    (pool.query as any).mockResolvedValueOnce({ rows: mockRows });

    const response = await getDashboard();

    expect(response.status).toBe(200);
    expect(response.body.data[0].outreach_partner).toBeNull();
  });

  it("scopes the query to the organisation id from the token", async () => {
    (pool.query as any).mockResolvedValueOnce({ rows: [] });

    await getDashboard();

    const callArgs = (pool.query as any).mock.calls[0];
    expect(callArgs[1]).toHaveLength(1);
    expect(callArgs[1][0]).toBe(commercialUser.organisationId);
  });

  it("returns JSON content-type", async () => {
    (pool.query as any).mockResolvedValueOnce({ rows: [] });

    const response = await getDashboard();

    expect(response.headers["content-type"]).toMatch(/application\/json/);
  });

  it("returns 500 when the query fails", async () => {
    (pool.query as any).mockRejectedValueOnce(new Error("DB down"));

    const response = await getDashboard();

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });

  it("returns 401 when there is no token", async () => {
    const response = await request(app).get(ROUTE);

    expect(response.status).toBe(401);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("returns 403 when the user's org type is not 'commercial'", async () => {
    const response = await request(app)
      .get(ROUTE)
      .set("Authorization", tokenFor({ ...commercialUser, orgType: "outreach" }));

    expect(response.status).toBe(403);
    expect(pool.query).not.toHaveBeenCalled();
  });


});
