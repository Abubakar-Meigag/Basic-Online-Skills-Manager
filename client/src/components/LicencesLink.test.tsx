import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import LicencesLink from "./LicencesLink";

describe("LicencesLink", () => {
  it("renders a link to /third-party-licences.txt that opens safely in a new tab", () => {
    render(<LicencesLink />);

    const link = screen.getByRole("link", { name: /^licences$/i });
    expect(link).toHaveAttribute("href", "/third-party-licences.txt");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
