// tests/integration/api/poll-id.test.ts

import { GET } from "@/app/api/polls/[id]/route";
import { Poll } from "@/models/Poll";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

// 1. Ən vacib hissə: Bazaya qoşulmağa imkan vermirik (Mock edirik)
jest.mock("@/lib/mongodb", () => ({
  connectDB: jest.fn(),
}));

describe("GET /api/polls/[id] integration tests", () => {

  // Hər testdən sonra təmizlik işləri
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 for invalid ID format", async () => {
    // Sənin API kodun 'isValid' yoxlayır, "12345" valid deyil.
    const context = {
      params: Promise.resolve({ id: "12345" }),
    };

    const req = {} as NextRequest; // GET üçün boş request bəs edir

    const res = await GET(req, context);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toBe("Invalid Poll ID format.");
  });

  it("should return 404 when poll does not exist", async () => {
    // MOCK: Poll.findById çağırılanda 'null' qaytarsın
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

    // MOCK: Bazadan gələcək data (Yalandan yaradırıq)
    const mockPoll = {
      _id: validId,
      title: "Test poll",
      description: "desc",
      ownerId: "user1",
      // Digər sahələr bu test üçün vacib deyil
    };

    // MOCK: Poll.findById çağırılanda bizim datanı qaytarsın
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