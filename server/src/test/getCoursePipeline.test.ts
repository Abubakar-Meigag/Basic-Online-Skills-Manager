import request from "supertest";
import app from "../app";
import pool from "../data/connection";

vi.mock("../data/connection", () => ({
  default: { query: vi.fn() },
}));

describe("GET /course-pipeline", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns all six status keys even when db is empty", async () => {
    (pool.query as any).mockResolvedValueOnce({ rows: [] });
    const response = await request(app).get("/course-pipeline");
    expect(response.status).toBe(200);
    expect(Object.keys(response.body).sort()).toEqual([
      "course_completed",
      "course_running",
      "request_claimed",
      "request_confirmed",
      "request_open",
      "request_pending",
    ]);
  });

  it("returns every status as an empty array when db is empty", async () => {
    (pool.query as any).mockResolvedValueOnce({ rows: [] });
    const response = await request(app).get("/course-pipeline");
    expect(response.body).toEqual({
      request_pending: [],
      request_open: [],
      request_claimed: [],
      request_confirmed: [],
      course_running: [],
      course_completed: [],
    });
  });

  it("groups each course under its matching status", async () => {
    const mockRows = [
      {
        id: "1",
        city: "Blackpool",
        status: "request_pending",
        commercial_org: "Capgemini",
        outreach_org: null,
      },
      {
        id: "2",
        city: "Leeds",
        status: "course_running",
        commercial_org: "Capgemini",
        outreach_org: "New Beginnings",
      },
    ];

    (pool.query as any).mockResolvedValueOnce({ rows: mockRows });
    const response = await request(app).get("/course-pipeline");
    expect(response.status).toBe(200);
    expect(response.body.request_pending).toEqual([mockRows[0]]);
    expect(response.body.course_running).toEqual([mockRows[1]]);
  });

  it("keeps statuses with no courses as empty arrays", async () => {
    const mockRows = [
      {
        id: "1",
        city: "Blackpool",
        status: "request_pending",
        commercial_org: "Capgemini",
        outreach_org: null,
      },
    ];

    (pool.query as any).mockResolvedValueOnce({ rows: mockRows });
    const response = await request(app).get("/course-pipeline");
    expect(response.body.request_pending).toHaveLength(1);
    expect(response.body.course_completed).toEqual([]);
    expect(response.body.request_claimed).toEqual([]);
  });

  it("puts multiple courses of the same status in one array", async () => {
    const mockRows = [
      {
        id: "1",
        city: "Blackpool",
        status: "request_pending",
        commercial_org: "Capgemini",
        outreach_org: null,
      },
      {
        id: "2",
        city: "Newcastle",
        status: "request_pending",
        commercial_org: "Capgemini",
        outreach_org: null,
      },
    ];

    (pool.query as any).mockResolvedValueOnce({ rows: mockRows });
    const response = await request(app).get("/course-pipeline");
    expect(response.body.request_pending).toHaveLength(2);
  });

  it("returns JSON content-type", async () => {
    (pool.query as any).mockResolvedValueOnce({ rows: [] });
    const response = await request(app).get("/course-pipeline");
    expect(response.headers["content-type"]).toMatch(/application\/json/);
  });

  it("returns 500 when the query fails", async () => {
    (pool.query as any).mockRejectedValueOnce(new Error("DB down"));
    const response = await request(app).get("/course-pipeline");
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });
});

