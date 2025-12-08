import { POST } from "@/app/api/polls/[id]/vote/route";
import { Poll } from "@/models/Poll";
import { NextRequest } from "next/server";

jest.mock("@/lib/mongodb", () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
}));

type ContextType = { params: Promise<{ id: string }> };

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

    const context: ContextType = { params: Promise.resolve({ id: "" }) };

    const res = await POST(req, context);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("pollId tələb olunur.");
  });

  it("returns 400 for invalid vote body", async () => {
    const req = createMockRequest({
      tempVoterId: "",
      voterName: "",
      selectedSlots: "invalid",
    });

    const context: ContextType = { params: Promise.resolve({ id: "valid-id" }) };

    const res = await POST(req, context);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("tempVoterId, voterName və selectedSlots natamamdır.");
  });

  it("returns 404 when poll is missing", async () => {
    const mockChain = {
      exec: jest.fn().mockResolvedValue(null)
    };

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

    const mockPollResponse = {
      toObject: () => ({
        votes: [{ voterId: "v1", voterName: "Alice" }]
      })
    };

    const mockChain = {
      exec: jest.fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(mockPollResponse)
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
    expect(body.poll.votes).toHaveLength(1);
    expect(body.poll.votes[0].voterName).toBe("Alice");
  });

  it("updates existing vote", async () => {

    const mockPollResponse = {
      toObject: () => ({
        votes: [{ voterId: "v1", voterName: "New" }]
      })
    };

    const mockChain = {
      exec: jest.fn().mockResolvedValue(mockPollResponse)
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