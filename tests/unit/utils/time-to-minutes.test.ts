import timeToMinutes from "@/lib/utils/time-to-minutes";

describe("timeToMinutes", () => {
  test("converts HH:MM to total minutes correctly", () => {
    expect(timeToMinutes("00:00")).toBe(0);
    expect(timeToMinutes("00:05")).toBe(5);
    expect(timeToMinutes("01:00")).toBe(60);
    expect(timeToMinutes("10:30")).toBe(10 * 60 + 30);
    expect(timeToMinutes("23:59")).toBe(23 * 60 + 59);
  });

  test("handles single-digit hours and minutes", () => {
    expect(timeToMinutes("5:5")).toBe(5 * 60 + 5);
    expect(timeToMinutes("7:09")).toBe(7 * 60 + 9);
  });

  test("returns NaN if input is invalid", () => {
    expect(timeToMinutes("invalid")).toBeNaN();
    expect(timeToMinutes("12:")).toBeNaN();
    expect(timeToMinutes(":30")).toBeNaN();
  });

  test("handles edge cases properly", () => {
    expect(timeToMinutes("24:00")).toBe(24 * 60);
    expect(timeToMinutes("99:99")).toBe(99 * 60 + 99);
  });
});