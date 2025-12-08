
import { GET } from "@/app/api/polls/[id]/route";
import { Poll } from "@/models/Poll";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

jest.mock("@/lib/mongodb", () => ({
  connectDB: jest.fn(),
}));

describe("GET /api/polls/[id] integration tests", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 for invalid ID format", async () => {
    const context = {
      params: Promise.resolve({ id: "12345" }),
    };

    const req = {} as NextRequest;

    const res = await GET(req, context);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toBe("Invalid Poll ID format.");
  });

  it("should return 404 when poll does not exist", async () => {
    jest.spyOn(Poll, 'findById').mockResolvedValue(null);

    const validId = new mongoose.Types.ObjectId().toString();
    const context = {
      params: Promise.resolve({ id: validId }),
    };

    const req = {} as NextRequest;

    const res = await GET(req, context);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.message).toBe("Poll not found.");
  });

  it("should return poll by ID when exists", async () => {
    const validId = new mongoose.Types.ObjectId().toString();

    const mockPoll = {
      _id: validId,
      title: "Test poll",
      description: "desc",
      ownerId: "user1",
    };

    jest.spyOn(Poll, 'findById').mockResolvedValue(mockPoll);

    const context = {
      params: Promise.resolve({ id: validId }),
    };

    const req = {} as NextRequest;

    const res = await GET(req, context);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body._id).toBe(validId);
    expect(body.title).toBe("Test poll");
  });
});