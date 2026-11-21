import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";

describe("Third-Party Licences File Generation", () => {
  it("generates third-party-licences.txt with expected library licences during build", () => {
    const licenseFilePath = path.resolve(
      import.meta.dirname,
      "dist/third-party-licences.txt",
    );

    const content = fs.readFileSync(licenseFilePath, "utf8");

    expect(content.length).toBeGreaterThan(0);
    expect(content).toContain("axios");
    expect(content).toContain("MIT");
    expect(content).toContain("@headlessui/react");
  });
});
