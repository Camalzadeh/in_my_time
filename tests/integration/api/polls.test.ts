// tests/integration/api/polls.test.ts

import { POST } from "@/app/api/polls/route";
import { Poll } from "@/models/Poll";
import { NextRequest } from "next/server";

// Baza əlaqəsini söndürürük
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
    // FIX: API-nin tələb etdiyi dəqiq strukturu qurduq
    const newPollData = {
      title: "Valid Poll",
      description: "Test Description",
      ownerId: "mock-owner-id", // API bunu mütləq istəyir!
      config: {
        dailyStartTime: "09:00",
        dailyEndTime: "18:00",
        slotDuration: 30,
        targetDates: ["2025-01-01"] // API bunu config-in içində axtarır
      },
    };

    const mockCreatedPoll = {
      ...newPollData,
      _id: "mock-id-123",
    };

    // 'as any' ilə TypeScript xətasını keçirik
    jest.spyOn(Poll, 'create').mockResolvedValue(mockCreatedPoll as any);

    const req = createMockRequest(newPollData);

    const res = await POST(req);
    const body = await res.json();

    // Əgər yenə xəta olsa, səbəbini görmək üçün
    if (res.status !== 201) {
      console.log("API Error:", body);
    }

    expect(res.status).toBe(201);
    expect(body.pollId).toBe("mock-id-123");
    expect(body.message).toContain("Poll created successfully"); // Nöqtə fərqi ola bilər deyə toContain
  });

  it("should return 400 if title is missing", async () => {
    const invalidData = {
      description: "No title",
      ownerId: "some-owner",
      config: { targetDates: [] }
    };

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Burada API onsuz da if (!title) yoxlaması ilə 400 qaytaracaq.
    // Poll.create çağırılmayacaq, ona görə mockRejectedValue burada vacib deyil,
    // amma hər ehtimala saxlayırıq.
    jest.spyOn(Poll, 'create').mockRejectedValue(new Error("ValidationError"));

    const req = createMockRequest(invalidData);
    const res = await POST(req);

    expect(res.status).toBe(400);

    consoleSpy.mockRestore();
  });
});