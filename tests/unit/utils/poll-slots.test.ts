import { buildSelectedSlots } from "@/lib/utils/poll-slots";

describe("buildSelectedSlots", () => {
  test("returns empty array if targetDates is empty", () => {
    const result = buildSelectedSlots([], "09:00", "10:00", 30);
    expect(result).toEqual([]);
  });

  test("returns empty array if start or end time is invalid", () => {
    const result1 = buildSelectedSlots(["2025-03-10"], "invalid", "10:00", 30);
    const result2 = buildSelectedSlots(["2025-03-10"], "09:00", "invalid", 30);

    expect(result1).toEqual([]);
    expect(result2).toEqual([]);
  });

  test("returns empty array if start >= end", () => {
    const result = buildSelectedSlots(["2025-03-10"], "10:00", "09:00", 30);
    expect(result).toEqual([]);
  });

  test("generates slots for a single date", () => {
    const result = buildSelectedSlots(["2025-03-10"], "09:00", "10:00", 30);

    expect(result.length).toBe(2);
    expect(result).toEqual([
      new Date("2025-03-10T09:00").toISOString(),
      new Date("2025-03-10T09:30").toISOString(),
    ]);
  });

  test("generates slots across multiple dates", () => {
    const result = buildSelectedSlots(
      ["2025-03-10", "2025-03-11"],
      "09:00",
      "10:00",
      30
    );

    expect(result.length).toBe(4);
    expect(result).toEqual([
      new Date("2025-03-10T09:00").toISOString(),
      new Date("2025-03-10T09:30").toISOString(),
      new Date("2025-03-11T09:00").toISOString(),
      new Date("2025-03-11T09:30").toISOString(),
    ]);
  });

  test("handles slotDurationMinutes other than 30", () => {
    const result = buildSelectedSlots(["2025-03-10"], "09:00", "10:00", 15);

    expect(result.length).toBe(4);
    expect(result).toEqual([
      new Date("2025-03-10T09:00").toISOString(),
      new Date("2025-03-10T09:15").toISOString(),
      new Date("2025-03-10T09:30").toISOString(),
      new Date("2025-03-10T09:45").toISOString(),
    ]);
  });
});