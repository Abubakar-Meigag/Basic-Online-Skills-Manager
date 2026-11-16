import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import pool from "../data/connection";
import { OrganizationType } from "../data/dataType";
import jwt from "jsonwebtoken";
import app from "../app";
import { mockAuthUserLookup } from "./helpers/mockAuth";
import { JWT_TEST_SECRET } from "./helpers/testSecret";

vi.mock("../data/connection", () => ({
  default: {
    query: vi.fn(),
  },
}));

const tokenFor = (user: object) => [
  `token=${jwt.sign(user, JWT_TEST_SECRET, { algorithm: "HS256", expiresIn: "1h" })}`,
];

const activeOutreachUser = {
  id: "user-123",
  email: "partner@example.com",
  is_active: true,
  org_type: OrganizationType.OUTREACH_PARTNER,
  organisation_id: "org-outreach-99",
};

const activeCommercialUser = {
  id: "user-456",
  email: "partner@example.com",
  is_active: true,
  org_type: OrganizationType.COMMERCIAL_PARTNER,
  organisation_id: "org-comm-11",
};

describe("GET /outreach/courses", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (pool.query as any).mockReset();
  });

  it("returns 200 with courses list for an outreach partner", async () => {
    const mockCourses = [
      {
        id: "course-123",
        course_name: "Basic Online Skills",
        partner_organisation: "Capgemini",
        trainee_target: 15,
        venue_address: "Newcastle Community Center",
        start_date: "2026-09-01",
        end_date: "2026-09-21",
        status: "request_confirmed",
      },
    ];

    mockAuthUserLookup(pool, activeOutreachUser, { rows: mockCourses });

    const response = await request(app)
      .get("/outreach/courses")
      .set(
        "Cookie",
        tokenFor({
          id: activeOutreachUser.id,
          email: activeOutreachUser.email,
          orgType: OrganizationType.OUTREACH_PARTNER,
          organisationId: activeOutreachUser.organisation_id,
        }),
      );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockCourses);
    expect(pool.query).toHaveBeenCalled();
  });

  it("returns 200 with an empty array if the org hosts no courses", async () => {
    mockAuthUserLookup(pool, activeOutreachUser, { rows: [] });

    const response = await request(app)
      .get("/outreach/courses")
      .set(
        "Cookie",
        tokenFor({
          id: activeOutreachUser.id,
          email: activeOutreachUser.email,
          orgType: OrganizationType.OUTREACH_PARTNER,
          organisationId: activeOutreachUser.organisation_id,
        }),
      );

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("returns 403 when caller is NOT an outreach partner", async () => {
    mockAuthUserLookup(pool, activeCommercialUser, { rows: [] });

    const response = await request(app)
      .get("/outreach/courses")
      .set(
        "Cookie",
        tokenFor({
          id: activeCommercialUser.id,
          email: activeCommercialUser.email,
          orgType: OrganizationType.COMMERCIAL_PARTNER,
          organisationId: activeCommercialUser.organisation_id,
        }),
      );

    expect(response.status).toBe(403);
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  it("returns 401 when there is no token", async () => {
    const response = await request(app).get("/outreach/courses");

    expect(response.status).toBe(401);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("returns 500 when database query throws an error", async () => {
    mockAuthUserLookup(
      pool,
      activeOutreachUser,
      new Error("DB connection error"),
    );

    const response = await request(app)
      .get("/outreach/courses")
      .set(
        "Cookie",
        tokenFor({
          id: activeOutreachUser.id,
          email: activeOutreachUser.email,
          orgType: OrganizationType.OUTREACH_PARTNER,
          organisationId: activeOutreachUser.organisation_id,
        }),
      );

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Internal Server Error" });
  });
});
