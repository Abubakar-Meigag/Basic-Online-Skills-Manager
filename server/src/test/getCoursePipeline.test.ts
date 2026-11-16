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

const cyfUser = {
  id: "staff-1",
  email: "admin@codeyourfuture.io",
  orgType: OrganizationType.CYF_STAFF,
  organisationId: "9e27629b-5911-4858-b453-14a5d227afc6",
};

const activeCyfUser = {
  id: "staff-1",
  email: "admin@codeyourfuture.io",
  is_active: true,
  org_type: OrganizationType.CYF_STAFF,
  organisation_id: "9e27629b-5911-4858-b453-14a5d227afc6",
};

const getPipeline = () =>
  request(app).get("/course-pipeline").set("Cookie", tokenFor(cyfUser));

describe("GET /course-pipeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (pool.query as any).mockReset();
  });

  it("returns all six status keys even when db is empty", async () => {
    mockAuthUserLookup(pool, activeCyfUser, { rows: [] });
    const response = await getPipeline();
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
    mockAuthUserLookup(pool, activeCyfUser, { rows: [] });
    const response = await getPipeline();
    expect(response.status).toBe(200);
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

    mockAuthUserLookup(pool, activeCyfUser, { rows: mockRows });
    const response = await getPipeline();
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

    mockAuthUserLookup(pool, activeCyfUser, { rows: mockRows });
    const response = await getPipeline();
    expect(response.status).toBe(200);
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

    mockAuthUserLookup(pool, activeCyfUser, { rows: mockRows });
    const response = await getPipeline();
    expect(response.status).toBe(200);
    expect(response.body.request_pending).toHaveLength(2);
  });

  it("returns JSON content-type", async () => {
    mockAuthUserLookup(pool, activeCyfUser, { rows: [] });
    const response = await getPipeline();
    expect(response.headers["content-type"]).toMatch(/application\/json/);
  });

  it("returns 500 when the query fails", async () => {
    mockAuthUserLookup(pool, activeCyfUser, new Error("DB down"));
    const response = await getPipeline();
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });
});
