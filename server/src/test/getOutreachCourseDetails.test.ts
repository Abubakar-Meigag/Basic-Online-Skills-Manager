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

const NEW_BEGINNINGS = "5e51de52-9ea7-4809-ad21-8f4475e3b886";

const outreachUser = {
  id: "u-outreach",
  email: "partner@newbeginnings.org",
  orgType: OrganizationType.OUTREACH_PARTNER,
  organisationId: NEW_BEGINNINGS,
};

const activeOutreachUser = {
  id: "u-outreach",
  email: "partner@newbeginnings.org",
  is_active: true,
  org_type: OrganizationType.OUTREACH_PARTNER,
  organisation_id: NEW_BEGINNINGS,
};

describe("GET /course-details/outreach/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (pool.query as any).mockReset();
  });

  it("returns the course when it is an open opportunity", async () => {
    const mockCourse = {
      id: "course-1",
      commercial_org_id: "60ea2b0f-e04e-4f9a-ac72-38bae06d98bc",
      outreach_org_id: null,
      status: "request_open",
      commercial_org: "Capgemini",
      outreach_org: null,
    };
    mockAuthUserLookup(pool, activeOutreachUser, { rows: [mockCourse] });

    const response = await request(app)
      .get("/course-details/outreach/course-1")
      .set("Cookie", tokenFor(outreachUser));

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe("course-1");
  });

  it("returns the course when it is hosted by the caller's org", async () => {
    const mockCourse = {
      id: "course-1",
      commercial_org_id: "60ea2b0f-e04e-4f9a-ac72-38bae06d98bc",
      outreach_org_id: NEW_BEGINNINGS,
      status: "request_claimed",
      commercial_org: "Capgemini",
      outreach_org: "New Beginnings",
    };
    mockAuthUserLookup(pool, activeOutreachUser, { rows: [mockCourse] });

    const response = await request(app)
      .get("/course-details/outreach/course-1")
      .set("Cookie", tokenFor(outreachUser));

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe("course-1");
  });

  it("returns 403 when the course is neither open nor hosted by the caller", async () => {
    const mockCourse = {
      id: "course-1",
      commercial_org_id: "60ea2b0f-e04e-4f9a-ac72-38bae06d98bc",
      outreach_org_id: "some-other-outreach-org",
      status: "request_confirmed",
      commercial_org: "Capgemini",
      outreach_org: "Other Org",
    };
    mockAuthUserLookup(pool, activeOutreachUser, { rows: [mockCourse] });

    const response = await request(app)
      .get("/course-details/outreach/course-1")
      .set("Cookie", tokenFor(outreachUser));

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("error");
  });

  it("returns 404 when the course does not exist", async () => {
    mockAuthUserLookup(pool, activeOutreachUser, { rows: [] });

    const response = await request(app)
      .get("/course-details/outreach/missing")
      .set("Cookie", tokenFor(outreachUser));

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
  });

  it("returns 500 when the query fails", async () => {
    mockAuthUserLookup(pool, activeOutreachUser, new Error("DB down"));

    const response = await request(app)
      .get("/course-details/outreach/course-1")
      .set("Cookie", tokenFor(outreachUser));

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });
});
