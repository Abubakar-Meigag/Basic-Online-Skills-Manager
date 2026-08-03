import request from "supertest";
import app from "../app";
import pool from "../data/connection";

vi.mock("../data/connection", () => ({
      default: { query: vi.fn() },
}));


const ROUTE = "/commercial-dashboard";

describe(`GET ${ROUTE}`, () => {
      afterEach(() => {
            vi.clearAllMocks();
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
            (pool.query as any).mockResolvedValueOnce({ rows: mockRows });

            const response = await request(app).get(ROUTE);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ data: mockRows });
      });

      it("returns an empty data array when db is empty", async () => {
            (pool.query as any).mockResolvedValueOnce({ rows: [] });

            const response = await request(app).get(ROUTE);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ data: [] });
      });

      it("returns multiple courses in the data array", async () => {
            const mockRows = [
                  { id: "course-1", status: "request_pending", outreach_partner: null },
                  { id: "course-2", status: "course_running", outreach_partner: "New Beginnings" },
            ];
            (pool.query as any).mockResolvedValueOnce({ rows: mockRows });

            const response = await request(app).get(ROUTE);

            expect(response.body.data).toHaveLength(2);
            expect(response.body.data).toEqual(mockRows);
      });

      it("includes outreach_partner as null when a course is unclaimed", async () => {
            const mockRows = [
                  { id: "course-1", status: "request_open", outreach_partner: null },
            ];
            (pool.query as any).mockResolvedValueOnce({ rows: mockRows });

            const response = await request(app).get(ROUTE);

            expect(response.body.data[0].outreach_partner).toBeNull();
      });

      it("scopes the query to a single commercial org id", async () => {
            (pool.query as any).mockResolvedValueOnce({ rows: [] });

            await request(app).get(ROUTE);

            const callArgs = (pool.query as any).mock.calls[0];
            expect(callArgs[1]).toHaveLength(1);
            expect(typeof callArgs[1][0]).toBe("string");
      });

      it("returns JSON content-type", async () => {
            (pool.query as any).mockResolvedValueOnce({ rows: [] });

            const response = await request(app).get(ROUTE);

            expect(response.headers["content-type"]).toMatch(/application\/json/);
      });

      it("returns 500 when the query fails", async () => {
            (pool.query as any).mockRejectedValueOnce(new Error("DB down"));

            const response = await request(app).get(ROUTE);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("error");
      });


      // AUTH CASES — enable once login is ready.

      // it("returns 403 when there is no authenticated user", async () => {
      //   const response = await request(app).get(ROUTE);
      //   expect(response.status).toBe(403);
      //   expect(response.body).toHaveProperty("error");
      // });

      // it("returns 403 when the user's org type is not 'commercial'", async () => {
      //   const response = await request(app)
      //     .get(ROUTE)
      //     .set("x-test-user-type", "outreach"); // placeholder for however you inject auth
      //   expect(response.status).toBe(403);
      // });

      // it("uses the org id from the session, not from the client", async () => {
      //   (pool.query as any).mockResolvedValueOnce({ rows: [] });
      //   await request(app).get(ROUTE); // with an authenticated 'commercial' session
      //   const callArgs = (pool.query as any).mock.calls[0];
      //   expect(callArgs[1][0]).toBe("<the session's organisation_id>");
      // });

      // it("allows a 'commercial' user through and returns their courses", async () => {
      //   (pool.query as any).mockResolvedValueOnce({ rows: [{ id: "course-1" }] });
      //   const response = await request(app).get(ROUTE); // authenticated 'commercial'
      //   expect(response.status).toBe(200);
      //   expect(response.body.data).toHaveLength(1);
      // });
});