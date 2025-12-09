import { generateTimeSlots, formatTime } from "@/lib/utils/time-slots";

describe("generateTimeSlots", () => {
  test("generates correct time slots", () => {
    const start = new Date("2024-01-01T10:00:00.000Z");
    const end = new Date("2024-01-01T11:00:00.000Z");

    const slots = generateTimeSlots({ start, end }, 30);

    expect(slots.length).toBe(2);
    expect(slots[0].toISOString()).toBe("2024-01-01T10:00:00.000Z");
    expect(slots[1].toISOString()).toBe("2024-01-01T10:30:00.000Z");
  });

  test("stops before end time", () => {
    const start = new Date("2024-01-01T09:00:00.000Z");
    const end = new Date("2024-01-01T09:45:00.000Z");

    const slots = generateTimeSlots({ start, end }, 30);

    expect(slots.length).toBe(2);
    expect(slots[1].toISOString()).toBe("2024-01-01T09:30:00.000Z");
  });

  test("returns empty array when start >= end", () => {
    const start = new Date("2024-01-01T10:00:00.000Z");
    const end = new Date("2024-01-01T10:00:00.000Z");

    const slots = generateTimeSlots({ start, end }, 15);

    expect(slots).toEqual([]);
  });

  test("does not mutate original start date", () => {
    const start = new Date("2024-01-01T08:00:00.000Z");
    const end = new Date("2024-01-01T09:00:00.000Z");

    const originalStart = new Date(start);

    generateTimeSlots({ start, end }, 20);

    expect(start.toISOString()).toBe(originalStart.toISOString());
  });
});

describe("formatTime", () => {
  test("formats date as HH:MM", () => {
    const date = new Date("2024-01-01T15:45:00.000Z");

    const formatted = formatTime(date);

    expect(typeof formatted).toBe("string");
    expect(formatted.length).toBe(5);
  });

  test("formats single-digit hours/minutes correctly", () => {
    const date = new Date("2024-01-01T03:07:00.000Z");

    const formatted = formatTime(date);

    expect(formatted).toMatch(/^\d{2}:\d{2}$/); // "03:07"
  });
});