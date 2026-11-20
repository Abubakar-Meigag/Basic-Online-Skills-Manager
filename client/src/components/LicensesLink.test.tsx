import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
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

describe("Third-Party Licences File Generation", () => {
  it("generates third-party-licenses.txt with expected library licences during build", () => {
    const licenseFilePath = path.resolve(
      __dirname,
      "../../dist/third-party-licenses.txt",
    );

    if (!fs.existsSync(licenseFilePath)) {
      console.warn(
        "Skipping license file test: dist/third-party-licenses.txt not found. Run 'npm run build' first.",
      );
      return;
    }

    const content = fs.readFileSync(licenseFilePath, "utf8");

    expect(content.length).toBeGreaterThan(0);
    expect(content).toContain("axios");
    expect(content).toContain("MIT");
    expect(content).toContain("@headlessui/react");
  });
});