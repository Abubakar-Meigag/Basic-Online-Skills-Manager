import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MagicLinkLogin from "./MagicLinkLogin";
import * as authApi from "../../auth/authApi";

// Mock the API module so no network calls are attempted
vi.mock("../../auth/authApi");

describe("MagicLinkLogin Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the initial login card correctly", () => {
    render(<MagicLinkLogin />);
    // Check main title and input presence
    expect(
      screen.getByRole("heading", { name: /basic online skills Manager/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send login link/i }),
    ).toBeInTheDocument();
  });

  it("shows an error message when submitting an invalid email format", () => {
    render(<MagicLinkLogin />);

    const input = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole("button", {
      name: /send login link/i,
    });

    fireEvent.change(input, { target: { value: "invalid-email.com" } });
    fireEvent.click(submitButton);

    expect(
      screen.getByText(/please enter a valid email address/i),
    ).toBeInTheDocument();
  });

  it("clears the error message when the user resumes typing", () => {
    render(<MagicLinkLogin />);

    const input = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole("button", {
      name: /send login link/i,
    });

    fireEvent.change(input, { target: { value: "testemail" } });
    fireEvent.click(submitButton);
    expect(
      screen.getByText(/please enter a valid email address/i),
    ).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "testemail@" } });

    expect(
      screen.queryByText(/please enter a valid email address/i),
    ).not.toBeInTheDocument();
  });

  it("switches to the success view when a valid email is submitted", async () => {
    // Mock a successful API response
    vi.spyOn(authApi, "requestMagicLink").mockResolvedValue({
      message: "Magic link sent successfully",
    });

    render(<MagicLinkLogin />);

    const input = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole("button", {
      name: /send login link/i,
    });

    fireEvent.change(input, { target: { value: "test@cyf.com" } });
    fireEvent.click(submitButton);

    // wait for the promise to resolve and UI to update
    expect(
      await screen.findByRole("heading", { name: /check your inbox/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/test@cyf.com/i)).toBeInTheDocument();
    expect(screen.getByText(/link expires in 5 minutes/i)).toBeInTheDocument();
  });

  it("allows returning back to the login form from the success view", async () => {
    // Mock the successful API response here as well
    vi.spyOn(authApi, "requestMagicLink").mockResolvedValue({
      message: "Magic link sent successfully",
    });

    render(<MagicLinkLogin />);

    const input = screen.getByLabelText(/email address/i);
    fireEvent.change(input, { target: { value: "test@cyf.com" } });
    fireEvent.click(screen.getByRole("button", { name: /send login link/i }));

    // Wait for success screen to render
    const backButton = await screen.findByRole("button", {
      name: /back to login/i,
    });
    fireEvent.click(backButton);

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  });
});
