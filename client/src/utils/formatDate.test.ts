import formatDate from "./formatDate";

describe("formatDate", () => {
  it("should format ISO string to DD/MM/YYYY from non-UTC", () => {
    vi.stubEnv("TZ", "Asia/Tokyo");
    const result = formatDate("2026-09-30T00:00:00.000+09:00");
    expect(result).toBe("30/09/2026");
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });
});
