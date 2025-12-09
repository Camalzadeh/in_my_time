import generateSlots from "@/lib/utils/generate-slots";

describe("generateSlots", () => {
  test("generates correct ISO slot times", () => {
    const date = new Date("2025-03-10T00:00:00.000Z");
    const result = generateSlots(date, "09:00", "11:00", 30);

    expect(result.length).toBe(4);

    const expected = [
      new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 0).toISOString(),
      new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 30).toISOString(),
      new Date(date.getFullYear(), date.getMonth(), date.getDate(), 10, 0).toISOString(),
      new Date(date.getFullYear(), date.getMonth(), date.getDate(), 10, 30).toISOString(),
    ];

    expect(result).toEqual(expected);
  });

  test("handles non-midnight date and preserves date", () => {
    const date = new Date("2025-06-15T12:00:00.000Z");
    const result = generateSlots(date, "08:00", "09:00", 30);

    const expected = [
      new Date(date.getFullYear(), date.getMonth(), date.getDate(), 8, 0).toISOString(),
      new Date(date.getFullYear(), date.getMonth(), date.getDate(), 8, 30).toISOString(),
    ];

    expect(result).toEqual(expected);
  });
});