import request from "supertest";
import app from "../app";
import pool from "../data/connection";

vi.mock("../data/connection", () => ({
  default: { query: vi.fn() },
}));

describe("GET /organisations", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns an empty array when there are no organisations", async () => {
    (pool.query as any).mockResolvedValueOnce({ rows: [] });
    const response = await request(app).get("/organisations");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("returns organisations as a flat array", async () => {
    const mockRows = [
      { id: "1", organisation_name: "Capgemini", type: "commercial" },
      { id: "2", organisation_name: "New Beginnings", type: "outreach" },
    ];
    (pool.query as any).mockResolvedValueOnce({ rows: mockRows });
    const response = await request(app).get("/organisations");
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockRows);
  });

  it("includes id, organisation_name and type on each item", async () => {
    const mockRows = [
      { id: "1", organisation_name: "Capgemini", type: "commercial" },
    ];
    (pool.query as any).mockResolvedValueOnce({ rows: mockRows });
    const response = await request(app).get("/organisations");
    expect(response.body[0]).toHaveProperty("id");
    expect(response.body[0]).toHaveProperty("organisation_name");
    expect(response.body[0]).toHaveProperty("type");
  });

  it("returns JSON content-type", async () => {
    (pool.query as any).mockResolvedValueOnce({ rows: [] });
    const response = await request(app).get("/organisations");
    expect(response.headers["content-type"]).toMatch(/application\/json/);
  });

  it("returns 500 when the query fails", async () => {
    (pool.query as any).mockRejectedValueOnce(new Error("DB down"));
    const response = await request(app).get("/organisations");
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });
});
