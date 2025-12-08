import { POST } from "@/app/api/polls/[id]/vote/route";
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


describe("POST /api/polls/[id]/vote integration tests", () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterEach(async () => {
    await Poll.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("returns 400 when pollId is missing", async () => {
    const req = createMockRequest({
      tempVoterId: "v1",
      voterName: "John",
      selectedSlots: [new Date().toISOString()],
    });

    const context: ContextType = {
      params: Promise.resolve({ id: "" }),
    };

    const res = await POST(req, context);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("pollId tələb olunur.");
  });

  it("returns 400 for invalid vote body", async () => {
    const poll = await Poll.create({
      title: "Test Poll",
      description: "desc",
      ownerId: "owner-1",
      config: {
        targetDates: [new Date()],
        dailyStartTime: "09:00",
        dailyEndTime: "18:00",
        slotDuration: 60,
      },
      availableDates: [new Date()],
      votes: [],
    });

    const req = createMockRequest({
      tempVoterId: "",
      voterName: "",
      selectedSlots: "invalid",
    });

    const context: ContextType = {
      params: Promise.resolve({ id: poll._id.toString() }),
    };

    const res = await POST(req, context);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe(
      "tempVoterId, voterName və selectedSlots natamamdır."
    );
  });

  it("returns 404 when poll is missing", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    const req = createMockRequest({
      tempVoterId: "v1",
      voterName: "John",
      selectedSlots: [new Date().toISOString()],
    });

    const context: ContextType = {
      params: Promise.resolve({ id: fakeId }),
    };

    const res = await POST(req, context);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Səsvermə obyekti tapılmadı və ya yenilənmədi.");
  });

  it("creates a new vote", async () => {
    const poll = await Poll.create({
      title: "Team Meeting",
      description: "desc",
      ownerId: "owner-1",
      config: {
        targetDates: [new Date()],
        dailyStartTime: "09:00",
        dailyEndTime: "18:00",
        slotDuration: 30,
      },
      availableDates: [new Date()],
      votes: [],
    });

    const slots = [
      "2025-01-01T10:00:00.000Z",
      "2025-01-01T10:30:00.000Z",
    ];

    const req = createMockRequest({
      tempVoterId: "v1",
      voterName: "Alice",
      selectedSlots: slots,
    });

    const context: ContextType = {
      params: Promise.resolve({ id: poll._id.toString() }),
    };

    const res = await POST(req, context);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.poll.votes).toHaveLength(1);
    expect(body.poll.votes[0].voterId).toBe("v1");
    expect(body.poll.votes[0].voterName).toBe("Alice");
  });

  it("updates existing vote", async () => {
    const poll = await Poll.create({
      title: "Meeting",
      description: "desc",
      ownerId: "owner-1",
      config: {
        targetDates: [new Date()],
        dailyStartTime: "09:00",
        dailyEndTime: "18:00",
        slotDuration: 30,
      },
      availableDates: [new Date("2025-01-01T10:00:00.000Z")],
      votes: [
        {
          voterId: "v1",
          voterName: "Old",
          voterColor: "#000",
          selectedSlots: [new Date("2025-01-01T10:00:00.000Z")],
          votedAt: new Date(),
        },
      ],
    });

    const newSlots = [
      "2025-01-01T11:00:00.000Z",
      "2025-01-01T11:30:00.000Z",
    ];

    const req = createMockRequest({
      tempVoterId: "v1",
      voterName: "New",
      selectedSlots: newSlots,
    });

    const context: ContextType = {
      params: Promise.resolve({ id: poll._id.toString() }),
    };

    const res = await POST(req, context);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.poll.votes).toHaveLength(1);
    expect(body.poll.votes[0].voterName).toBe("New");
  });
});
