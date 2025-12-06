import { connectDB } from "@/lib/mongodb";
import { Poll } from "@/models/Poll";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { title, ownerId, config } = body;

    if (!title || !ownerId || !config) {
      return new Response(
        JSON.stringify({ message: "Title, owner ID, and config are required." }),
        { status: 400 }
      );
    }

    const targetDates = config.targetDates;
    const slotDuration =
      config.slotDuration ?? config.slotDurationMinutes;
    const dailyStartTime =
      config.dailyStartTime ?? (config.workStartHour != null ? `${config.workStartHour}:00` : null);
    const dailyEndTime =
      config.dailyEndTime ?? (config.workEndHour != null ? `${config.workEndHour}:00` : null);

    if (!Array.isArray(targetDates) || targetDates.length === 0) {
      return new Response(
        JSON.stringify({ message: "At least one target date required." }),
        { status: 400 }
      );
    }

    for (const d of targetDates) {
      if (isNaN(Date.parse(d))) {
        return new Response(
          JSON.stringify({ message: "Server error: Could not create poll." }),
          { status: 500 }
        );
      }
    }

    if (!slotDuration || typeof slotDuration !== "number") {
      return new Response(
        JSON.stringify({ message: "Slot duration must be a number." }),
        { status: 400 }
      );
    }

    if (!dailyStartTime || !dailyEndTime) {
      return new Response(
        JSON.stringify({ message: "Start and end times required." }),
        { status: 400 }
      );
    }

    const poll = await Poll.create({
      title,
      description: body.description ?? "",
      ownerId,
      config: {
        targetDates,
        slotDuration,
        dailyStartTime,
        dailyEndTime,
      },
      availableDates: targetDates.map((d) => new Date(d)),
    });

    return new Response(
      JSON.stringify({
        message: "Poll created successfully.",
        pollId: poll._id.toString(),
      }),
      { status: 201 }
    );

  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ message: "Server error: Could not create poll." }),
      { status: 500 }
    );
  }
}
