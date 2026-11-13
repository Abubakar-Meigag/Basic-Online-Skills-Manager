import request from "supertest";
import app from "../app";
import pool from "../data/connection";
import jwt from "jsonwebtoken";
import { mockAuthUserLookup } from "./helpers/mockAuth";
import { JWT_TEST_SECRET } from "./helpers/testSecret";

vi.mock("../data/connection", () => ({
  default: {
    connect: vi.fn(),
    query: vi.fn(),
  },
}));

const tokenFor = (user: object) => [
  `token=${jwt.sign(user, JWT_TEST_SECRET, { algorithm: "HS256", expiresIn: "1h" })}`,
];

const CAPGEMINI = "60ea2b0f-e04e-4f9a-ac72-38bae06d98bc";

const commercialUser = {
  id: "u-commercial",
  email: "partner@capgemini.com",
  orgType: "commercial",
  organisationId: CAPGEMINI,
};

const activeCommercialUser = {
  id: "u-commercial",
  email: "partner@capgemini.com",
  is_active: true,
  org_type: "commercial",
  organisation_id: CAPGEMINI,
};

const activeOutreachUser = {
  id: "u-outreach",
  email: "partner@outreach.com",
  is_active: true,
  org_type: "outreach",
  organisation_id: "org-outreach-1",
};

describe("GET /course-details/commercial/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (pool.query as any).mockReset();
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
    mockAuthUserLookup(pool, activeCommercialUser, { rows: [mockCourse] });

    const response = await request(app)
      .get("/course-details/commercial/course-1")
      .set("Cookie", tokenFor(commercialUser));

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
    mockAuthUserLookup(pool, activeCommercialUser, { rows: [mockCourse] });

    const response = await request(app)
      .get("/course-details/commercial/course-1")
      .set("Cookie", tokenFor(commercialUser));

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("error");
  });

  it("returns 404 when the course does not exist", async () => {
    mockAuthUserLookup(pool, activeCommercialUser, { rows: [] });

    const response = await request(app)
      .get("/course-details/commercial/missing")
      .set("Cookie", tokenFor(commercialUser));

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
  });

  it("returns 500 when the query fails", async () => {
    mockAuthUserLookup(pool, activeCommercialUser, new Error("DB down"));

    const response = await request(app)
      .get("/course-details/commercial/course-1")
      .set("Cookie", tokenFor(commercialUser));

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });

  it("returns 401 without a token", async () => {
    const response = await request(app).get(
      "/course-details/commercial/course-1",
    );

    expect(response.status).toBe(401);
  });

  it("returns 403 for a non-commercial role", async () => {
    mockAuthUserLookup(pool, activeOutreachUser, { rows: [] });

    const response = await request(app)
      .get("/course-details/commercial/course-1")
      .set("Cookie", tokenFor({ ...commercialUser, orgType: "outreach" }));

    expect(response.status).toBe(403);
  });
});
