import request from "supertest";
import app from "../app";
import pool from "../data/connection";

vi.mock("../data/connection", () => ({
      default: { query: vi.fn() },
}));

describe("GET /course-details/:id", () => {
      afterEach(() => {
            vi.clearAllMocks();
      });

      it("returns the full course record wrapped in data", async () => {
            const mockCourse = {
                  id: "37171645-0ccf-462f-91f1-8e56b33af267",
                  course_name: "Basic Online Skills",
                  commercial_org_id: "60ea2b0f-e04e-4f9a-ac72-38bae06d98bc",
                  outreach_org_id: "5e51de52-9ea7-4809-ad21-8f4475e3b886",
                  account_name: "National Highways",
                  contract_name: "DWS",
                  trainee_target: 10,
                  deadline: "2026-09-29T23:00:00.000Z",
                  city: "Birmingham",
                  status: "request_claimed",
                  commercial_org: "Capgemini",
                  outreach_org: "New Beginnings",
            };
            (pool.query as any).mockResolvedValueOnce({ rows: [mockCourse] });

            const response = await request(app).get(
                  "/course-details/37171645-0ccf-462f-91f1-8e56b33af267",
            );

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ data: mockCourse });
      });

      it("resolves both commercial and outreach organisation names", async () => {
            const mockCourse = {
                  id: "1",
                  status: "request_claimed",
                  commercial_org: "Capgemini",
                  outreach_org: "New Beginnings",
            };
            (pool.query as any).mockResolvedValueOnce({ rows: [mockCourse] });

            const response = await request(app).get("/course-details/1");
            expect(response.body.data.commercial_org).toBe("Capgemini");
            expect(response.body.data.outreach_org).toBe("New Beginnings");
      });

      it("returns outreach_org as null for an unassigned course", async () => {
            const mockCourse = {
                  id: "2",
                  status: "request_pending",
                  commercial_org: "Capgemini",
                  outreach_org: null,
            };
            (pool.query as any).mockResolvedValueOnce({ rows: [mockCourse] });

            const response = await request(app).get("/course-details/2");
            expect(response.body.data.outreach_org).toBeNull();
      });

      it("returns 404 when no course matches the id", async () => {
            (pool.query as any).mockResolvedValueOnce({ rows: [] });

            const response = await request(app).get(
                  "/course-details/nonexistent-id",
            );

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("error");
      });

      it("returns JSON content-type", async () => {
            (pool.query as any).mockResolvedValueOnce({ rows: [{ id: "1" }] });
            const response = await request(app).get("/course-details/1");
            expect(response.headers["content-type"]).toMatch(/application\/json/);
      });

      it("returns 500 when the query fails", async () => {
            (pool.query as any).mockRejectedValueOnce(new Error("DB down"));
            const response = await request(app).get("/course-details/1");
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("error");
      });
});