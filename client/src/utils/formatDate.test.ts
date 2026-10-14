import formatDate from "./formatDate";

describe("formatDate", () => {
  it("should format ISO string to DD/MM/YYYY", () => {
    const result = formatDate("2026-09-30T00:00:00.000Z");
    expect(result).toBe("30/09/2026");
  });
});
