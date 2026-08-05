import request from "supertest";
import app from "../app";
import pool from "../data/connection";

vi.mock("../data/connection", () => ({
  default: { query: vi.fn() },
}));

describe("GET /opportunities", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns an empty array when there are no open opportunities", async () => {
    (pool.query as any).mockResolvedValueOnce({ rows: [] });
    const response = await request(app).get("/opportunities");
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
    const response = await request(app).get("/opportunities");
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
    const response = await request(app).get("/opportunities");
    expect(response.body[0].commercial_org).toBe("Capgemini");
  });

  it("returns JSON content-type", async () => {
    (pool.query as any).mockResolvedValueOnce({ rows: [] });
    const response = await request(app).get("/opportunities");
    expect(response.headers["content-type"]).toMatch(/application\/json/);
  });

  it("returns 500 when the query fails", async () => {
    (pool.query as any).mockRejectedValueOnce(new Error("DB down"));
    const response = await request(app).get("/opportunities");
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });
});
