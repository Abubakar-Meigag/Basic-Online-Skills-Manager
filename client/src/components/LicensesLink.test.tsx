import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import LicensesLink from "./LicensesLink";

describe("LicensesLink", () => {
  it("renders a link to /third-party-licenses.txt that opens safely in a new tab", () => {
    render(<LicensesLink />);

    const link = screen.getByRole("link", { name: /^licenses$/i });
    expect(link).toHaveAttribute("href", "/third-party-licenses.txt");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});