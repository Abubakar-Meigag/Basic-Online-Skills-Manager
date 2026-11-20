import formatDate from "./formatDate";

describe("formatDate", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should format ISO string to DD/MM/YYYY", () => {
    const result = formatDate("2026-09-30T00:00:00.000Z");
    expect(result).toBe("30/09/2026");
  });

  it("should use the next day when UTC is past midnight BST", () => {
    vi.stubEnv("TZ", "Europe/London");
    const result = formatDate("2026-09-29T23:00:00.000Z");
    expect(result).toBe("30/09/2026");
  });

  it("should use the current day when UTC is midnight", () => {
    vi.stubEnv("TZ", "Africa/Johannesburg");
    const result = formatDate("2026-09-30T00:00:00.000+02:00");
    expect(result).toBe("30/09/2026");
  });
});
