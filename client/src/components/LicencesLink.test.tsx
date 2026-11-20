import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
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

describe("Third-Party Licences File Generation", () => {
  it("generates third-party-licences.txt with expected library licences during build", () => {
    const licenseFilePath = path.resolve(
      __dirname,
      "../../dist/third-party-licences.txt",
    );

    const content = fs.readFileSync(licenseFilePath, "utf8");

    expect(content.length).toBeGreaterThan(0);
    expect(content).toContain("axios");
    expect(content).toContain("MIT");
    expect(content).toContain("@headlessui/react");
  });
});
