import request from "supertest";
import app from "../app";
import pool from "../data/connection";
import jwt from "jsonwebtoken";
import { OrganizationType } from "../data/dataType";
import { mockAuthUserLookup } from "./helpers/mockAuth";
import { JWT_TEST_SECRET } from "./helpers/testSecret";

vi.mock("../data/connection", () => ({
  default: { query: vi.fn() },
}));

const tokenFor = (user: object) => [
  `token=${jwt.sign(user, JWT_TEST_SECRET, { algorithm: "HS256", expiresIn: "1h" })}`,
];

const staffUser = {
  id: "staff-1",
  email: "admin@codeyourfuture.io",
  orgType: OrganizationType.CYF_STAFF,
  organisationId: "9e27629b-5911-4858-b453-14a5d227afc6",
};

const activeStaffUser = {
  id: "staff-1",
  email: "admin@codeyourfuture.io",
  is_active: true,
  org_type: OrganizationType.CYF_STAFF,
  organisation_id: "9e27629b-5911-4858-b453-14a5d227afc6",
};

describe("GET /course-details/staff/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (pool.query as any).mockReset();
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
    mockAuthUserLookup(pool, activeStaffUser, { rows: [mockCourse] });

    const response = await request(app)
      .get("/course-details/staff/course-1")
      .set("Cookie", tokenFor(staffUser));

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe("course-1");
    expect(response.body.data.commercial_org).toBe("Capgemini");
  });

  it("returns 404 when the course does not exist", async () => {
    mockAuthUserLookup(pool, activeStaffUser, { rows: [] });

    const response = await request(app)
      .get("/course-details/staff/missing")
      .set("Cookie", tokenFor(staffUser));

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
  });

  it("returns 500 when the query fails", async () => {
    mockAuthUserLookup(pool, activeStaffUser, new Error("DB down"));

    const response = await request(app)
      .get("/course-details/staff/course-1")
      .set("Cookie", tokenFor(staffUser));

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });
});
