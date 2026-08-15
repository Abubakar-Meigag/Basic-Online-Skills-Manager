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

const CAPGEMINI = "60ea2b0f-e04e-4f9a-ac72-38bae06d98bc";

const commercialUser = {
  id: "u-commercial",
  email: "partner@capgemini.com",
  orgType: "commercial",
  organisationId: CAPGEMINI,
};

describe("GET /course-details/commercial/:id", () => {
  beforeEach(() => {
    mockUser = commercialUser;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns the course when it belongs to the caller's org", async () => {
    const mockCourse = {
      id: "course-1",
      commercial_org_id: CAPGEMINI,
      outreach_org_id: null,
      status: "request_pending",
      commercial_org: "Capgemini",
      outreach_org: null,
    };
    (pool.query as any).mockResolvedValueOnce({ rows: [mockCourse] });

    const response = await request(app).get(
      "/course-details/commercial/course-1",
    );

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe("course-1");
  });

  it("returns 403 when the course belongs to another org", async () => {
    const mockCourse = {
      id: "course-1",
      commercial_org_id: "some-other-org",
      outreach_org_id: null,
      status: "request_pending",
      commercial_org: "Deloitte",
      outreach_org: null,
    };
    (pool.query as any).mockResolvedValueOnce({ rows: [mockCourse] });

    const response = await request(app).get(
      "/course-details/commercial/course-1",
    );

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("error");
  });

  it("returns 404 when the course does not exist", async () => {
    (pool.query as any).mockResolvedValueOnce({ rows: [] });

    const response = await request(app).get(
      "/course-details/commercial/missing",
    );

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
  });

  it("returns 500 when the query fails", async () => {
    (pool.query as any).mockRejectedValueOnce(new Error("DB down"));

    const response = await request(app).get(
      "/course-details/commercial/course-1",
    );

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });
});
