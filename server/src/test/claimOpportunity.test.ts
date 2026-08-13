import { describe, it, expect, beforeEach, vi } from "vitest";
import { Request, Response } from "express";
import claimOpportunity from "../api/claimOpportunity";
import pool from "../data/connection";

vi.mock("../data/connection");

describe("claimOpportunity", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: ReturnType<typeof vi.fn>;
  let jsonMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    jsonMock = vi.fn().mockReturnValue(undefined);
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });

    req = {
      params: { id: "course-1" },
      body: {
        start_date: "2026-09-05",
        venue_address: "234-244 Stockwell Rd, London",
        contact_name: "John Doe",
        contact_email: "john@example.com",
      },
    } as any;

    (req as any).user = {
      id: "user-1",
      organisationId: "org-2",
      orgType: "outreach",
    };

    res = {
      status: statusMock,
      json: jsonMock,
    } as any;
  });

  describe("Authorization", () => {
    it("should reject non-outreach users", async () => {
      (req as any).user.orgType = "commercial";

      await claimOpportunity(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Forbidden" });
    });

    it("should reject unauthenticated users", async () => {
      (req as any).user = null;

      await claimOpportunity(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
    });

    it("should reject requests from users without organisationId", async () => {
      (req as any).user.organisationId = null;

      await claimOpportunity(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "organisationId query param is required",
      });
    });
  });

  describe("Course Validation", () => {
    it("should return 404 if course not found", async () => {
      vi.mocked(pool.query).mockResolvedValue({ rows: [] } as any);

      await claimOpportunity(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Course not found" });
    });

    it("should return 409 if course already claimed", async () => {
      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [
          {
            id: "course-1",
            outreach_org_id: "org-1",
            status: "request_open",
          },
        ],
      } as any);

      await claimOpportunity(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Course already claimed",
      });
    });

    it("should return 409 if course status is not request_open", async () => {
      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [
          {
            id: "course-1",
            outreach_org_id: null,
            status: "request_closed",
          },
        ],
      } as any);

      await claimOpportunity(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Course not available to be claimed",
      });
    });
  });

  describe("Successful Claim", () => {
    it("should successfully claim a course", async () => {
      const mockCourse = {
        id: "course-1",
        outreach_org_id: null,
        status: "request_open",
        commercial_org: "Capgemini",
        outreach_org: null,
      };

      vi.mocked(pool.query)
        .mockResolvedValueOnce({ rows: [mockCourse] } as any)
        .mockResolvedValueOnce({} as any)
        .mockResolvedValueOnce({} as any);

      await claimOpportunity(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(mockCourse);
    });
  });
});
