import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import MagicLinkLogin from "./MagicLinkLogin";

describe("MagicLinkLogin Component", () => {
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

    // Type invalid email and submit
    fireEvent.change(input, { target: { value: "invalid-email.com" } });
    fireEvent.click(submitButton);

    // Assert error message appears
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

    // Trigger error state
    fireEvent.change(input, { target: { value: "testemail" } });
    fireEvent.click(submitButton);
    expect(
      screen.getByText(/please enter a valid email address/i),
    ).toBeInTheDocument();

    // Type new character
    fireEvent.change(input, { target: { value: "testemail@" } });

    // Assert error message is removed
    expect(
      screen.queryByText(/please enter a valid email address/i),
    ).not.toBeInTheDocument();
  });

  it("switches to the success view when a valid email is submitted", () => {
    render(<MagicLinkLogin />);

    const input = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole("button", {
      name: /send login link/i,
    });

    // Type valid email and submit
    fireEvent.change(input, { target: { value: "test@cyf.com" } });
    fireEvent.click(submitButton);

    // Assert state switch to success view
    expect(
      screen.getByRole("heading", { name: /check your inbox/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/test@cyf.com/i)).toBeInTheDocument();
    expect(screen.getByText(/link expires in 5 minutes/i)).toBeInTheDocument();
  });

  it("allows returning back to the login form from the success view", () => {
    render(<MagicLinkLogin />);

    // Move to success view first
    const input = screen.getByLabelText(/email address/i);
    fireEvent.change(input, { target: { value: "test@cyf.com" } });
    fireEvent.click(screen.getByRole("button", { name: /send login link/i }));

    // Click back button
    const backButton = screen.getByRole("button", { name: /back to login/i });
    fireEvent.click(backButton);

    // Assert form is back
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  });
});
