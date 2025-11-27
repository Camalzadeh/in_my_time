import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Poll } from '@/models/Poll';
import { generateAvailableSlots } from '@/lib/slot-generator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Incoming Poll Data:", body);

    await connectDB();
    console.log("MongoDB connected.");

    const { title, description, ownerId, config } = body;

    if (!title || !ownerId || !config) {
      return NextResponse.json(
        { message: 'Title, owner ID, and config are required.' },
        { status: 400 }
      );
    }

    // SAFELY normalize targetDates → always valid Date()
    const normalizedConfig = {
      ...config,
      targetDates: (config.targetDates || []).map((d: string | Date) => {
        const date = new Date(d);
        if (isNaN(date.getTime())) {
          throw new Error("Invalid date in targetDates: " + d);
        }
        return date;
      }),
    };

    const availableDates = generateAvailableSlots(normalizedConfig);

    const newPoll = await Poll.create({
      title,
      description: description || '',
      ownerId,
      config: normalizedConfig,
      availableDates,
    });

    console.log("Poll saved successfully.");

    return NextResponse.json(
      {
        message: 'Poll created successfully.',
        pollId: newPoll._id,
        shareUrl: `/poll/${newPoll._id}`
      },
      { status: 201 }
    );

  } catch (error: unknown) {
    console.error("CRITICAL SERVER ERROR:", error);
  
    const message =
      error instanceof Error ? error.message : "Unknown server error";
  
    return NextResponse.json(
      {
        message: "Server error: Could not create poll.",
        detail: message,
      },
      { status: 500 }
    );
  }  
}
