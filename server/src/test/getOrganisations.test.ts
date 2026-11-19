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

describe("GET /organisations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (pool.query as any).mockReset();
  });

  it("returns an empty array when there are no organisations", async () => {
    mockAuthUserLookup(pool, activeCyfUser, { rows: [] });
    const response = await request(app)
      .get("/organisations")
      .set("Cookie", tokenFor(cyfUser));
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("returns organisations as a flat array", async () => {
    const mockRows = [
      { id: "1", organisation_name: "Capgemini", type: "commercial" },
      { id: "2", organisation_name: "New Beginnings", type: "outreach" },
    ];
    mockAuthUserLookup(pool, activeCyfUser, { rows: mockRows });
    const response = await request(app)
      .get("/organisations")
      .set("Cookie", tokenFor(cyfUser));
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockRows);
  });

  it("includes id, organisation_name and type on each item", async () => {
    const mockRows = [
      { id: "1", organisation_name: "Capgemini", type: "commercial" },
    ];
    mockAuthUserLookup(pool, activeCyfUser, { rows: mockRows });
    const response = await request(app)
      .get("/organisations")
      .set("Cookie", tokenFor(cyfUser));
    expect(response.status).toBe(200);
    expect(response.body[0]).toHaveProperty("id");
    expect(response.body[0]).toHaveProperty("organisation_name");
    expect(response.body[0]).toHaveProperty("type");
  });

  it("returns JSON content-type", async () => {
    mockAuthUserLookup(pool, activeCyfUser, { rows: [] });
    const response = await request(app)
      .get("/organisations")
      .set("Cookie", tokenFor(cyfUser));
    expect(response.headers["content-type"]).toMatch(/application\/json/);
  });

  it("returns 500 when the query fails", async () => {
    mockAuthUserLookup(pool, activeCyfUser, new Error("DB down"));
    const response = await request(app)
      .get("/organisations")
      .set("Cookie", tokenFor(cyfUser));
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });
});
