import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import PrivacyLink from "./PrivacyLink";

describe("PrivacyLink", () => {
  it("renders a link to the CYF privacy policy that opens safely in a new tab", () => {
    render(<PrivacyLink />);

    const link = screen.getByRole("link", { name: /^privacy$/i });
    expect(link).toHaveAttribute(
      "href",
      "https://codeyourfuture.io/privacy-policy/",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
