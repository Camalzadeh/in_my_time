import { generateDateRange, getNextWeekRange, getNextMonthRange } from "@/lib/utils/date-ranges";

describe("generateDateRange", () => {
  test("returns empty array for invalid dates", () => {
    expect(generateDateRange("invalid", "2025-01-01")).toEqual([]);
    expect(generateDateRange("2025-01-01", "invalid")).toEqual([]);
  });

  test("returns empty array if start > end", () => {
    expect(generateDateRange("2025-01-10", "2025-01-01")).toEqual([]);
  });

  test("generates correct range for valid dates", () => {
    const result = generateDateRange("2025-01-01", "2025-01-03");
    expect(result).toEqual(["2025-01-01", "2025-01-02", "2025-01-03"]);
  });

  test("handles single-day range", () => {
    const result = generateDateRange("2025-01-01", "2025-01-01");
    expect(result).toEqual(["2025-01-01"]);
  });
});

describe("getNextWeekRange", () => {
  test("returns Monday to Sunday for a given date", () => {
    const today = new Date("2025-12-10T00:00:00Z");
    const range = getNextWeekRange(today);

    expect(range.start).toBe("2025-12-15");
    expect(range.end).toBe("2025-12-21");
  });

  test("works correctly if today is already Monday", () => {
    const today = new Date("2025-12-15T00:00:00Z");
    const range = getNextWeekRange(today);

    expect(range.start).toBe("2025-12-15");
    expect(range.end).toBe("2025-12-21");
  });
});

describe("getNextMonthRange", () => {
  test("returns first and last day of next month", () => {
    const today = new Date("2025-01-15T00:00:00Z");
    const range = getNextMonthRange(today);

    const expectedStart = new Date(today.getFullYear(), today.getMonth() + 1, 1)
      .toISOString()
      .slice(0, 10);
    const expectedEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0)
      .toISOString()
      .slice(0, 10);

    expect(range.start).toBe(expectedStart);
    expect(range.end).toBe(expectedEnd);
  });

  test("handles December correctly (rolls over to next year)", () => {
    const today = new Date("2025-12-10T00:00:00Z");
    const range = getNextMonthRange(today);

    const expectedStart = new Date(today.getFullYear(), today.getMonth() + 1, 1)
      .toISOString()
      .slice(0, 10);
    const expectedEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0)
      .toISOString()
      .slice(0, 10);

    expect(range.start).toBe(expectedStart);
    expect(range.end).toBe(expectedEnd);
  });
});