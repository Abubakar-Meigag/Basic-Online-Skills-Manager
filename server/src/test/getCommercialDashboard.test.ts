import request from "supertest";
import app from "../app";
import pool from "../data/connection";
import jwt from "jsonwebtoken";
import { OrganizationType } from "../data/dataType";
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

const commercialUser = {
  id: "u2",
  email: "partner@example.org",
  orgType: "commercial",
  organisationId: "60ea2b0f-e04e-4f9a-ac72-38bae06d98bc",
};

const activeCommercialUser = {
  id: "u2",
  email: "partner@example.org",
  is_active: true,
  org_type: OrganizationType.COMMERCIAL_PARTNER,
  organisation_id: "60ea2b0f-e04e-4f9a-ac72-38bae06d98bc",
};

const activeOutreachUser = {
  id: "u3",
  email: "outreach@example.org",
  is_active: true,
  org_type: OrganizationType.OUTREACH_PARTNER,
  organisation_id: "org-outreach-1",
};

const ROUTE = "/commercial-dashboard";

const getDashboard = () =>
  request(app).get(ROUTE).set("Cookie", tokenFor(commercialUser));

describe(`GET ${ROUTE}`, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (pool.query as any).mockReset();
  });

  it("returns 200 with a data array when db has rows", async () => {
    const mockRows = [
      {
        id: "course-1",
        course_name: "Basic Online Skills",
        account_name: "Capgemini",
        contract_name: "Debt",
        trainee_target: 15,
        deadline: "2026-09-30",
        city: "Blackpool",
        status: "request_pending",
        start_date: null,
        end_date: null,
        outreach_partner: null,
      },
    ];
    mockAuthUserLookup(pool, activeCommercialUser, { rows: mockRows });

    const response = await getDashboard();

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: mockRows });
  });

  it("returns an empty data array when db is empty", async () => {
    mockAuthUserLookup(pool, activeCommercialUser, { rows: [] });

    const response = await getDashboard();

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: [] });
  });

  it("returns multiple courses in the data array", async () => {
    const mockRows = [
      { id: "course-1", status: "request_pending", outreach_partner: null },
      {
        id: "course-2",
        status: "course_running",
        outreach_partner: "New Beginnings",
      },
    ];
    mockAuthUserLookup(pool, activeCommercialUser, { rows: mockRows });

    const response = await getDashboard();

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data).toEqual(mockRows);
  });

  it("includes outreach_partner as null when a course is unclaimed", async () => {
    const mockRows = [
      { id: "course-1", status: "request_open", outreach_partner: null },
    ];
    mockAuthUserLookup(pool, activeCommercialUser, { rows: mockRows });

    const response = await getDashboard();

    expect(response.status).toBe(200);
    expect(response.body.data[0].outreach_partner).toBeNull();
  });

  it("scopes the query to the organisation id from the token", async () => {
    mockAuthUserLookup(pool, activeCommercialUser, { rows: [] });

    await getDashboard();

    const routeCall = (pool.query as any).mock.calls.find(
      (call: any[]) =>
        Array.isArray(call[1]) && call[1][0] === commercialUser.organisationId,
    );

    expect(routeCall).toBeDefined();
    expect(routeCall[1]).toHaveLength(1);
    expect(routeCall[1][0]).toBe(commercialUser.organisationId);
  });

  it("returns JSON content-type", async () => {
    mockAuthUserLookup(pool, activeCommercialUser, { rows: [] });

    const response = await getDashboard();

    expect(response.headers["content-type"]).toMatch(/application\/json/);
  });

  it("returns 500 when the query fails", async () => {
    mockAuthUserLookup(pool, activeCommercialUser, new Error("DB down"));

    const response = await getDashboard();

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });

  it("returns 401 when there is no token", async () => {
    const response = await request(app).get(ROUTE);

    expect(response.status).toBe(401);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("returns 403 when the user's org type is not 'commercial'", async () => {
    mockAuthUserLookup(pool, activeOutreachUser, { rows: [] });

    const response = await request(app)
      .get(ROUTE)
      .set("Cookie", tokenFor({ ...commercialUser, orgType: "outreach" }));

    expect(response.status).toBe(403);
    expect(pool.query).toHaveBeenCalledTimes(1);
  });
});
