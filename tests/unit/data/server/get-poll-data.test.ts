import { getPollDataServer } from "@/lib/data/server/get-poll-data";

jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}));

jest.mock("@/lib/mongodb", () => ({
  connectDB: jest.fn(),
}));

jest.mock("@/models/Poll", () => ({
  Poll: { findById: jest.fn() },
}));

import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { Poll } from "@/models/Poll";

const VALID_ID = "6929706508c6645b99b18675";

const mockFindById = (result: unknown) => {
  (Poll.findById as jest.Mock).mockReturnValue({
    lean: jest.fn().mockResolvedValue(result),
  });
};

describe("getPollDataServer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("reads the poll from the database and returns plain JSON", async () => {
    const votedAt = new Date("2025-11-25T09:00:00.000Z");
    mockFindById({ _id: VALID_ID, title: "Test poll?", votes: [{ votedAt }] });

    const result = await getPollDataServer(VALID_ID);

    expect(connectDB).toHaveBeenCalled();
    expect(Poll.findById).toHaveBeenCalledWith(VALID_ID);
    expect(result).toEqual({
      _id: VALID_ID,
      title: "Test poll?",
      votes: [{ votedAt: votedAt.toISOString() }],
    });
  });

  test("never reaches the database for a malformed id", async () => {
    await getPollDataServer("not-an-object-id");

    expect(notFound).toHaveBeenCalled();
    expect(Poll.findById).not.toHaveBeenCalled();
  });

  test("calls notFound() when the poll does not exist", async () => {
    mockFindById(null);

    await getPollDataServer(VALID_ID);

    expect(notFound).toHaveBeenCalled();
  });

  test("lets a database error propagate", async () => {
    (Poll.findById as jest.Mock).mockReturnValue({
      lean: jest.fn().mockRejectedValue(new Error("connection timed out")),
    });

    await expect(getPollDataServer(VALID_ID)).rejects.toThrow("connection timed out");
  });
});
