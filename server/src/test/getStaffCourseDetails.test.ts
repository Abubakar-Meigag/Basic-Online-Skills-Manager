import request from "supertest";
import app from "../app";
import pool from "../data/connection";

vi.mock("../data/connection", () => ({
  default: { query: vi.fn() },
}));

let mockUser: Record<string, unknown> | null = null;
vi.mock("./../middleware/authMiddleware", () => ({
  authorizeRole: () => (req: any, _res: any, next: any) => {
    req.user = mockUser;
    next();
  },
}));

const staffUser = {
  id: "staff-1",
  email: "admin@codeyourfuture.io",
  orgType: "cyf_staff",
  organisationId: "9e27629b-5911-4858-b453-14a5d227afc6",
};

describe("GET /course-details/staff/:id", () => {
  beforeEach(() => {
    mockUser = staffUser;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns the course for any id (staff can view any course)", async () => {
    const mockCourse = {
      id: "course-1",
      commercial_org_id: "60ea2b0f-e04e-4f9a-ac72-38bae06d98bc",
      outreach_org_id: null,
      status: "request_pending",
      commercial_org: "Capgemini",
      outreach_org: null,
    };
    (pool.query as any).mockResolvedValueOnce({ rows: [mockCourse] });

    const response = await request(app).get("/course-details/staff/course-1");

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe("course-1");
    expect(response.body.data.commercial_org).toBe("Capgemini");
  });

  it("returns 404 when the course does not exist", async () => {
    (pool.query as any).mockResolvedValueOnce({ rows: [] });

    const response = await request(app).get("/course-details/staff/missing");

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
  });

  it("returns 500 when the query fails", async () => {
    (pool.query as any).mockRejectedValueOnce(new Error("DB down"));

    const response = await request(app).get("/course-details/staff/course-1");

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });
});
