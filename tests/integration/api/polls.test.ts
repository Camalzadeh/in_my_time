import { POST } from "@/app/api/polls/route";
import { connectDB } from "@/lib/mongodb";
import { Poll } from "@/models/Poll";

describe("POST /api/polls integration tests", () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await Poll.deleteMany({});
  });

  it("should return 400 if title, ownerId, or config are missing", async () => {
    const req = {
      json: async () => ({
        title: "",
        ownerId: "",
        config: null,
      }),
    } as any;

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toBe("Title, owner ID, and config are required.");
  });

  it("should return 500 if config contains invalid date", async () => {
    const req = {
      json: async () => ({
        title: "Invalid Date Poll",
        ownerId: "user123",
        description: "test",
        config: {
          targetDates: ["NOT_A_DATE"],
          slotDurationMinutes: 30,
          workStartHour: 9,
          workEndHour: 18,
        },
      }),
    } as any;

    const res = await POST(req);
    const body = await res.json();

    // NextResponse JSON-unun statusu Response obyektində olur
    expect(res.status).toBe(500);
    expect(body.message).toBe("Server error: Could not create poll.");
  });

  it("should create poll successfully and return 201", async () => {
    const req = {
      json: async () => ({
        title: "Valid Poll",
        description: "Some description",
        ownerId: "user123",
        config: {
            targetDates: ["2024-02-25T10:00"],
            slotDuration: 60,
            dailyStartTime: "09:00",
            dailyEndTime: "17:00",
        },

      }),
    } as any;

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.message).toBe("Poll created successfully.");
    expect(body.pollId).toBeDefined();

    const dbPoll = await Poll.findById(body.pollId);
    expect(dbPoll).not.toBeNull();
    expect(dbPoll!.title).toBe("Valid Poll");
  });
});
