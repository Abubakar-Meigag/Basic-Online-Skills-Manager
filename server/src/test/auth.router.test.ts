import request from "supertest";
import app from "../app";
import * as authService from "../auth/auth.service";

// Mock the service layer functions
vi.mock("../auth/auth.service", () => ({
  requestMagicLink: vi.fn(),
  verifyMagicLinkToken: vi.fn(),
}));

describe("Auth Router (/api/auth)", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/auth/magic-link", () => {
    it("returns 200 with generic message for a valid email", async () => {
      (authService.requestMagicLink as any).mockResolvedValueOnce(undefined);

      const response = await request(app)
        .post("/api/auth/magic-link")
        .send({ email: "user@example.com" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "If an account exists, a link has been sent.",
      });
      expect(authService.requestMagicLink).toHaveBeenCalledWith(
        "user@example.com",
      );
    });

    it("returns 400 if email is missing or invalid", async () => {
      const response = await request(app).post("/api/auth/magic-link").send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "error",
        "A valid email is required.",
      );
      expect(authService.requestMagicLink).not.toHaveBeenCalled();
    });

    it("returns 500 when service layer throws an error", async () => {
      (authService.requestMagicLink as any).mockRejectedValueOnce(
        new Error("Database failure"),
      );

      const response = await request(app)
        .post("/api/auth/magic-link")
        .send({ email: "user@example.com" });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error", "Internal server error.");
    });
  });

  describe("POST /api/auth/verify", () => {
    it("returns 200 and user payload for valid raw token", async () => {
      const mockResult = {
        user: {
          id: "1",
          email: "user@example.com",
          organisation_type: "commercial",
        },
        redirectRoute: "/dashboard/commercial-partner",
      };

      (authService.verifyMagicLinkToken as any).mockResolvedValueOnce(
        mockResult,
      );

      const response = await request(app)
        .post("/api/auth/verify")
        .send({ token: "valid-raw-token-123" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Authentication successful.",
        user: mockResult.user,
        redirectRoute: mockResult.redirectRoute,
      });
      expect(authService.verifyMagicLinkToken).toHaveBeenCalledWith(
        "valid-raw-token-123",
      );
    });

    it("returns 400 if token is missing", async () => {
      const response = await request(app).post("/api/auth/verify").send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Token is required.");
    });

    it("returns 400 with specific error message when token is expired or used", async () => {
      (authService.verifyMagicLinkToken as any).mockRejectedValueOnce(
        new Error("Link has expired."),
      );

      const response = await request(app)
        .post("/api/auth/verify")
        .send({ token: "expired-token" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Link has expired." });
    });
  });

  describe("GET /api/auth/verify", () => {
    it("extracts token from query parameter and verifies successfully", async () => {
      const mockResult = {
        user: {
          id: "1",
          email: "charity@example.com",
          organisation_type: "outreach",
        },
        redirectRoute: "/dashboard/outreach-partner",
      };

      (authService.verifyMagicLinkToken as any).mockResolvedValueOnce(
        mockResult,
      );

      const response = await request(app).get(
        "/api/auth/verify?token=query-token-456",
      );

      expect(response.status).toBe(200);
      expect(response.body.redirectRoute).toBe("/dashboard/outreach-partner");
      expect(authService.verifyMagicLinkToken).toHaveBeenCalledWith(
        "query-token-456",
      );
    });
  });
});
