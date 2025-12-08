import { POST } from "@/app/api/polls/[id]/finalize/route";
import { connectDB } from "@/lib/mongodb";
import { Poll } from "@/models/Poll";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

type ContextType = { params: Promise<{ id: string }> };

function createMockRequest(body: unknown): NextRequest {
  return {
    json: async () => body,
    cookies: {
      get: () => undefined,
      getAll: () => [],
      set: () => {},
      delete: () => {},
    },
    nextUrl: {
      pathname: "/",
      search: "",
      href: "http://localhost"
    } as unknown as URL,
    body: null,
    cache: "default",
    credentials: "same-origin",
    destination: "document",
    headers: new Headers(),
    integrity: "",
    keepalive: false,
    method: "POST",
    mode: "cors",
    redirect: "follow",
    referrer: "",
    referrerPolicy: "",
    signal: {} as AbortSignal,
    url: "http://localhost",
  } as unknown as NextRequest;
}


describe("POST /api/polls/[id]/finalize integration tests", () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterEach(async () => {
    await Poll.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("returns 400 for invalid payload", async () => {
    const req = createMockRequest({
      status: "open",
      finalDate: null,
    });

    const context: ContextType = {
      params: Promise.resolve({ id: new mongoose.Types.ObjectId().toString() }),
    };

    const res = await POST(req, context);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toBe(
      "Invalid payload: status must be 'closed' and finalDate required"
    );
  });

  it("returns 400 for invalid poll ID format", async () => {
    const req = createMockRequest({
      status: "closed",
      finalDate: new Date().toISOString(),
    });

    const context: ContextType = {
      params: Promise.resolve({ id: "12345" }),
    };

    const res = await POST(req, context);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toBe("Invalid Poll ID format");
  });

  it("returns 404 when poll is missing", async () => {
    const req = createMockRequest({
      status: "closed",
      finalDate: new Date().toISOString(),
    });

    const context: ContextType = {
      params: Promise.resolve({ id: new mongoose.Types.ObjectId().toString() }),
    };

    const res = await POST(req, context);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.message).toBe("Poll not found");
  });

  it("finalizes poll successfully", async () => {
    const poll = await Poll.create({
      title: "Finalization Test",
      description: "Test Desc",
      ownerId: "owner-1",
      config: {
        targetDates: [new Date()],
        dailyStartTime: "09:00",
        dailyEndTime: "18:00",
        slotDuration: 30,
      },
      availableDates: [new Date()],
      votes: [],
      status: "open",
    });

    const finalDate = new Date("2025-01-01T12:00:00.000Z").toISOString();

    const req = createMockRequest({
      status: "closed",
      finalDate,
    });

    const context: ContextType = {
      params: Promise.resolve({ id: poll._id.toString() }),
    };

    const res = await POST(req, context);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Poll finalized successfully");
    expect(body.poll._id.toString()).toBe(poll._id.toString());
    expect(body.poll.status).toBe("finalized");
    expect(new Date(body.poll.finalTime).toISOString()).toBe(finalDate);
  });
});
