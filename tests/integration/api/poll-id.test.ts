import { GET } from "@/app/api/poll/[id]/route";
import { connectDB } from "@/lib/mongodb";
import { Poll } from "@/models/Poll";
import mongoose from "mongoose";

describe("GET /api/poll/[id] integration tests", () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await Poll.deleteMany({});
    await mongoose.connection.close();
  });

  it("should return 400 for invalid ID format", async () => {
    const context = {
      params: Promise.resolve({ id: "12345" }) // invalid ID
    };

    const req: any = {};

    const res = await GET(req, context);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toBe("Invalid Poll ID format.");
  });

  it("should return 404 when poll does not exist", async () => {
    const context = {
      params: Promise.resolve({ id: "64d9f0f8c19a4d23a8c9a111" }) // valid but not exists
    };

    const req: any = {};

    const res = await GET(req, context);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.message).toBe("Poll not found.");
  });

  it("should return poll by ID when exists", async () => {
    const poll = await Poll.create({
        title: "Test poll",
        description: "desc",
        ownerId: "user1",
        config: {
            targetDates: [new Date()],
            slotDuration: 60,
            dailyStartTime: 9,
            dailyEndTime: 18,
        },
        availableDates: [new Date()],
        });


    const context = {
      params: Promise.resolve({ id: poll._id.toString() })
    };

    const req: any = {};

    const res = await GET(req, context);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body._id).toBe(poll._id.toString());
    expect(body.title).toBe("Test poll");
  });
});
