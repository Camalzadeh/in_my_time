import generateSlots from "@/lib/utils/generate-slots";
import timeToMinutes from "@/lib/utils/time-to-minutes";

jest.mock("@/lib/utils/time-to-minutes");

describe("generateSlots", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("generates correct ISO slot times", () => {
    (timeToMinutes as jest.Mock)
      .mockReturnValueOnce(9 * 60)
      .mockReturnValueOnce(11 * 60);

    const date = "2025-03-10";
    const result = generateSlots(date, "09:00", "11:00", 30);

    expect(result.length).toBe(4);

    expect(result).toEqual([
      new Date("2025-03-10T09:00:00.000Z").toISOString(),
      new Date("2025-03-10T09:30:00.000Z").toISOString(),
      new Date("2025-03-10T10:00:00.000Z").toISOString(),
      new Date("2025-03-10T10:30:00.000Z").toISOString(),
    ]);
  });

  test("returns empty array when start == end", () => {
    (timeToMinutes as jest.Mock)
      .mockReturnValueOnce(600)
      .mockReturnValueOnce(600);

    const result = generateSlots("2025-03-10", "10:00", "10:00", 15);

    expect(result).toEqual([]);
  });

  test("returns empty when start > end", () => {
    (timeToMinutes as jest.Mock)
      .mockReturnValueOnce(700)
      .mockReturnValueOnce(600);

    const result = generateSlots("2025-03-10", "11:40", "10:00", 15);

    expect(result).toEqual([]);
  });

  test("handles non-midnight date and preserves date", () => {
    (timeToMinutes as jest.Mock)
      .mockReturnValueOnce(8 * 60)
      .mockReturnValueOnce(9 * 60);

    const date = new Date("2025-06-15T15:20:00Z");
    const result = generateSlots(date, "08:00", "09:00", 30);

    expect(result).toEqual([
      new Date("2025-06-15T08:00:00.000Z").toISOString(),
      new Date("2025-06-15T08:30:00.000Z").toISOString(),
    ]);
  });
});