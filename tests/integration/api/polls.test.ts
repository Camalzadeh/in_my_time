import { POST } from "@/app/api/polls/route";
import { Poll } from "@/models/Poll";
import { NextRequest } from "next/server";

jest.mock("@/lib/mongodb", () => ({
  connectDB: jest.fn(),
}));

function createMockRequest(body: unknown): NextRequest {
  return {
    json: async () => body,
    cookies: { get: () => undefined, getAll: () => [], set: () => {}, delete: () => {} },
    nextUrl: { pathname: "/api/polls", search: "", href: "http://localhost/api/polls" } as unknown as URL,
    body: null,
    headers: new Headers(),
    method: "POST",
    url: "http://localhost/api/polls",
  } as unknown as NextRequest;
}

describe("POST /api/polls integration tests", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create poll successfully and return 201", async () => {
    const newPollData = {
      title: "Valid Poll",
      description: "Test Description",
      ownerId: "mock-owner-id",
      config: {
        dailyStartTime: "09:00",
        dailyEndTime: "18:00",
        slotDuration: 30,
        targetDates: ["2025-01-01"]
      },
    };

    const mockCreatedPoll = {
      ...newPollData,
      _id: "mock-id-123",
    };

    jest.spyOn(Poll, 'create').mockResolvedValue(mockCreatedPoll as any);

    const req = createMockRequest(newPollData);

    const res = await POST(req);
    const body = await res.json();

    if (res.status !== 201) {
      console.log("API Error:", body);
    }

    expect(res.status).toBe(201);
    expect(body.pollId).toBe("mock-id-123");
    expect(body.message).toContain("Poll created successfully");
  });

  it("should return 400 if title is missing", async () => {
    const invalidData = {
      description: "No title",
      ownerId: "some-owner",
      config: { targetDates: [] }
    };

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    jest.spyOn(Poll, 'create').mockRejectedValue(new Error("ValidationError"));

    const req = createMockRequest(invalidData);
    const res = await POST(req);

    expect(res.status).toBe(400);

    consoleSpy.mockRestore();
  });
});