// tests/integration/api/finalize.test.ts

import { POST } from "@/app/api/polls/[id]/finalize/route";
import { Poll } from "@/models/Poll";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

// 1. Database əlaqəsini söndürürük
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

describe("POST /api/polls/[id]/finalize integration tests", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 for invalid payload", async () => {
    const req = createMockRequest({ status: "open", finalDate: null });
    const context: ContextType = { params: Promise.resolve({ id: "valid-id" }) };

    const res = await POST(req, context);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toContain("Invalid payload");
  });

  it("returns 400 for invalid poll ID format", async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // FIX: API CastError gözləyir, ona görə mock-u elə qururuq ki, xəta atsın
    jest.spyOn(Poll, 'findById').mockRejectedValue(new mongoose.Error.CastError('ObjectId', '12345', 'model'));

    const req = createMockRequest({ status: "closed", finalDate: new Date().toISOString() });
    const context: ContextType = { params: Promise.resolve({ id: "12345" }) };

    const res = await POST(req, context);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toBe("Invalid Poll ID format");
    consoleSpy.mockRestore();
  });

  it("returns 404 when poll is missing", async () => {
    jest.spyOn(Poll, 'findById').mockResolvedValue(null);

    const req = createMockRequest({ status: "closed", finalDate: new Date().toISOString() });
    const context: ContextType = { params: Promise.resolve({ id: new mongoose.Types.ObjectId().toString() }) };

    const res = await POST(req, context);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.message).toBe("Poll not found");
  });

  it("finalizes poll successfully", async () => {
    const validId = new mongoose.Types.ObjectId().toString();
    const finalDate = new Date("2025-01-01T12:00:00.000Z").toISOString();

    // 1. findById çağırılanda boş olmayan bir obyekt qaytarsın (404 olmasın)
    jest.spyOn(Poll, 'findById').mockResolvedValue({ _id: validId } as any);

    // 2. ƏSAS HİSSƏ: findByIdAndUpdate çağırılanda yenilənmiş datanı qaytarsın
    // Sənin API kodun bunu gözləyir!
    jest.spyOn(Poll, 'findByIdAndUpdate').mockResolvedValue({
      _id: validId,
      status: 'finalized',
      finalTime: finalDate,
      updatedAt: new Date()
    } as any);

    const req = createMockRequest({ status: "closed", finalDate });
    const context: ContextType = { params: Promise.resolve({ id: validId }) };

    const res = await POST(req, context);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Poll finalized successfully");
    expect(body.poll.status).toBe("finalized");
  });
});