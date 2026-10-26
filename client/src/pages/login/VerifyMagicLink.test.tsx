import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import VerifyMagicLink from "./VerifyMagicLink";
import * as authApi from "../../auth/authApi";

// Mock the authApi module
vi.mock("../../auth/authApi");

// Mock useNavigate while keeping the rest of react-router-dom intact
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("VerifyMagicLink Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should show an error message if no token is present in the URL", async () => {
    // Render the component wrapped in MemoryRouter without a query parameter
    render(
      <MemoryRouter initialEntries={["/verify"]}>
        <VerifyMagicLink />
      </MemoryRouter>,
    );

    // Assert that the error text renders
    expect(
      await screen.findByText("Invalid or missing verification link."),
    ).toBeInTheDocument();
  });

  it("should verify token and navigate on success", async () => {
    const mockData = {
      message: "Success",
      user: { id: "123", email: "test@example.com", orgType: "admin" },
      redirectRoute: "/dashboard",
    };
    vi.spyOn(authApi, "verifyMagicLink").mockResolvedValue(mockData);

    // Render with valid ?token=valid-token in URL
    render(
      <MemoryRouter initialEntries={["/verify?token=valid-token"]}>
        <VerifyMagicLink />
      </MemoryRouter>,
    );

    // Verify loading message shows initially
    expect(screen.getByText("Verifying Magic Link...")).toBeInTheDocument();

    // Wait for the async effect to complete and check expectations
    await waitFor(() => {
      expect(authApi.verifyMagicLink).toHaveBeenCalledWith("valid-token");

      // Keeping user metadata in localStorage
      expect(localStorage.getItem("user")).toBe(JSON.stringify(mockData.user));

      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  }); // Assert error output renders in UI

  it("should render error message when backend verification fails", async () => {
    const mockError = {
      response: { data: { message: "Link has expired." } },
    };
    vi.spyOn(authApi, "verifyMagicLink").mockRejectedValue(mockError);

    render(
      <MemoryRouter initialEntries={["/verify?token=expired-token"]}>
        <VerifyMagicLink />
      </MemoryRouter>,
    );

    // Assert error output renders in UI
    expect(
      await screen.findByRole("heading", { name: /authentication error/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/verification failed or link has expired/i),
    ).toBeInTheDocument();
  });
});
