import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import pool from "../data/connection";
import { OrganizationType } from "../data/dataType";
import getOutreachCourses from "../api/outreachCourses";

// 1. Mock the database pool
vi.mock("../data/connection", () => ({
  default: {
    query: vi.fn(),
  },
}));

// 2. Create a test app instance that injects a mock user into req
const testApp = express();
testApp.use(express.json());

// Middleware helper to simulate different user states in tests
let mockUserOverride: any = null;

testApp.use((req, _res, next) => {
  (req as any).user = mockUserOverride;
  next();
});

testApp.get("/outreach/courses", getOutreachCourses);

describe("GET /outreach/courses", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default logged-in user for happy paths
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
    // Simulate a commercial or CYF staff user attempting access
    mockUserOverride = {
      id: "user-456",
      orgType: OrganizationType.COMMERCIAL_PARTNER,
      organisationId: "org-comm-11",
    };

    const response = await request(testApp).get("/outreach/courses");

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: "Forbidden: Outreach access required.",
    });
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("returns 403 when no user session is present on req", async () => {
    // Simulate unauthenticated request
    mockUserOverride = null;

    const response = await request(testApp).get("/outreach/courses");

    expect(response.status).toBe(403);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("returns 500 when database query throws an error", async () => {
    (pool.query as any).mockRejectedValueOnce(new Error("DB connection error"));

    const response = await request(testApp).get("/outreach/courses");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Internal Server Error" });
  });
});
