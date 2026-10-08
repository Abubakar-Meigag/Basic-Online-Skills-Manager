import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import pool from "../data/connection";
import { OrganizationType } from "../data/dataType";
import getOutreachCourses from "../api/outreachCourses";
import jwt from "jsonwebtoken";
import app from "../app";

// TODO: these 3 tests (200 list, 200 empty, 500) still use the fake testApp
// and an injected req.user. Refactor them to use the real app + tokenFor()
// so they go through authorizeRole. Left as is for now to keep coverage.

vi.mock("../data/connection", () => ({
  default: {
    query: vi.fn(),
  },
}));

process.env.JWT_SECRET = "test-secret";

const tokenFor = (user: object) =>
  `Bearer ${jwt.sign(user, process.env.JWT_SECRET!, { algorithm: "HS256", expiresIn: "1h" })}`;

const testApp = express();
testApp.use(express.json());

let mockUserOverride: any = null;

testApp.use((req, _res, next) => {
  (req as any).user = mockUserOverride;
  next();
});

testApp.get("/outreach/courses", getOutreachCourses);

describe("GET /outreach/courses", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserOverride = {
      id: "user-123",
      email: "partner@example.com",
      orgType: OrganizationType.OUTREACH_PARTNER,
      organisationId: "org-outreach-99",
    };
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

    (pool.query as any).mockResolvedValueOnce({ rows: mockCourses });

    const response = await request(testApp).get("/outreach/courses");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockCourses);
    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("WHERE c.outreach_org_id = $1"),
      ["org-outreach-99"],
    );
  });

  it("returns 200 with an empty array if the org hosts no courses", async () => {
    (pool.query as any).mockResolvedValueOnce({ rows: [] });

    const response = await request(testApp).get("/outreach/courses");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("returns 403 when caller is NOT an outreach partner", async () => {
    const response = await request(app)
      .get("/outreach/courses")
      .set(
        "Authorization",
        tokenFor({
          id: "user-456",
          orgType: OrganizationType.COMMERCIAL_PARTNER,
          organisationId: "org-comm-11",
        }),
      );

    expect(response.status).toBe(403);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("returns 401 when there is no token", async () => {
    const response = await request(app).get("/outreach/courses");

    expect(response.status).toBe(401);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("returns 500 when database query throws an error", async () => {
    (pool.query as any).mockRejectedValueOnce(new Error("DB connection error"));

    const response = await request(testApp).get("/outreach/courses");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Internal Server Error" });
  });
});
