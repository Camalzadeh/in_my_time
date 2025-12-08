// tests/integration/api/vote.test.ts

import { POST } from "@/app/api/polls/[id]/vote/route"; // Route importunu dəqiq yoxla
import { Poll } from "@/models/Poll";
import { NextRequest } from "next/server";

// 1. Bazaya qoşulmağa qoymuruq
jest.mock("@/lib/mongodb", () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
}));

// Context tipi
type ContextType = { params: Promise<{ id: string }> };

// Mock Request Yaradan
function createMockRequest(body: unknown): NextRequest {
  return {
    json: async () => body,
    cookies: { get: () => undefined, getAll: () => [], set: () => {}, delete: () => {} },
    nextUrl: { pathname: "/", search: "", href: "http://localhost" } as unknown as URL,
    body: null,
    headers: new Headers(),
    method: "POST",
    url: "http://localhost",
  } as unknown as NextRequest;
}

describe("POST /api/polls/[id]/vote integration tests", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 when pollId is missing", async () => {
    const req = createMockRequest({
      tempVoterId: "v1",
      voterName: "John",
      selectedSlots: [new Date().toISOString()],
    });

    // ID boşdur
    const context: ContextType = { params: Promise.resolve({ id: "" }) };

    const res = await POST(req, context);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("pollId tələb olunur.");
  });

  it("returns 400 for invalid vote body", async () => {
    const req = createMockRequest({
      tempVoterId: "", // Boşdur
      voterName: "",
      selectedSlots: "invalid", // Array deyil
    });

    const context: ContextType = { params: Promise.resolve({ id: "valid-id" }) };

    const res = await POST(req, context);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("tempVoterId, voterName və selectedSlots natamamdır.");
  });

  it("returns 404 when poll is missing", async () => {
    // API kodunda .exec() var deyə, biz gərək .exec() qaytaran bir obyekt mock edək
    const mockChain = {
      exec: jest.fn().mockResolvedValue(null) // Hər iki halda null qaytarsın
    };

    // findOneAndUpdate çağırılanda bu zənciri qaytarır
    jest.spyOn(Poll, 'findOneAndUpdate').mockReturnValue(mockChain as any);

    const req = createMockRequest({
      tempVoterId: "v1",
      voterName: "John",
      selectedSlots: [new Date().toISOString()],
    });

    const context: ContextType = { params: Promise.resolve({ id: "missing-id" }) };

    const res = await POST(req, context);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Səsvermə obyekti tapılmadı və ya yenilənmədi.");
  });

  it("creates a new vote", async () => {
    // Senari: 
    // 1. Birinci findOneAndUpdate (update) -> NULL qaytarır (yəni belə səs yoxdur).
    // 2. İkinci findOneAndUpdate (push) -> POLL qaytarır (səs əlavə olundu).

    const mockPollResponse = {
      toObject: () => ({
        votes: [{ voterId: "v1", voterName: "Alice" }]
      })
    };

    const mockChain = {
      exec: jest.fn()
          .mockResolvedValueOnce(null) // 1. Update cəhdi uğursuz
          .mockResolvedValueOnce(mockPollResponse) // 2. Create cəhdi uğurlu
    };

    jest.spyOn(Poll, 'findOneAndUpdate').mockReturnValue(mockChain as any);

    const req = createMockRequest({
      tempVoterId: "v1",
      voterName: "Alice",
      selectedSlots: ["2025-01-01T10:00:00.000Z"],
    });

    const context: ContextType = { params: Promise.resolve({ id: "poll-id" }) };

    const res = await POST(req, context);
    const body = await res.json();

    expect(res.status).toBe(200);
    // Mock obyektimizdə nə qaytarmışıqsa onu yoxlayırıq
    expect(body.poll.votes).toHaveLength(1);
    expect(body.poll.votes[0].voterName).toBe("Alice");
  });

  it("updates existing vote", async () => {
    // Senari: Birinci findOneAndUpdate dərhal POLL qaytarır.

    const mockPollResponse = {
      toObject: () => ({
        votes: [{ voterId: "v1", voterName: "New" }]
      })
    };

    const mockChain = {
      exec: jest.fn().mockResolvedValue(mockPollResponse) // Dərhal tapdı və yenilədi
    };

    jest.spyOn(Poll, 'findOneAndUpdate').mockReturnValue(mockChain as any);

    const req = createMockRequest({
      tempVoterId: "v1",
      voterName: "New",
      selectedSlots: ["2025-01-01T11:00:00.000Z"],
    });

    const context: ContextType = { params: Promise.resolve({ id: "poll-id" }) };

    const res = await POST(req, context);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.poll.votes[0].voterName).toBe("New");
  });
});