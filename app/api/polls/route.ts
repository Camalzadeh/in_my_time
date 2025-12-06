import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Poll } from '@/models/Poll';
import { generateAvailableSlots } from '@/lib/utils/slot-generator';
import { UI_PATHS} from "@/lib/routes";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { title, description, ownerId, config } = body;

    if (!title || typeof title !== "string") {
      return new Response(JSON.stringify({ message: "Title is required." }), { status: 400 });
    }

    const { targetDates, dailyStartTime, dailyEndTime, slotDuration } = config || {};

    const MAX_DAYS = 60;        
    const MIN_SLOT = 5;        
    const MAX_SLOT = 720;       

    if (!Array.isArray(targetDates) || targetDates.length === 0) {
      return new Response(JSON.stringify({ message: "At least one target date required." }), { status: 400 });
    }

    if (targetDates.length > MAX_DAYS) {
      return new Response(JSON.stringify({ message: `Too many days selected. Maximum allowed is ${MAX_DAYS}.` }), {
        status: 400,
      });
    }

    for (const d of targetDates) {
      if (isNaN(Date.parse(d))) {
        return new Response(JSON.stringify({ message: `Invalid date: ${d}` }), { status: 400 });
      }
    }

    if (!dailyStartTime || !dailyEndTime) {
      return new Response(JSON.stringify({ message: "Start and end times required." }), { status: 400 });
    }

    if (dailyEndTime <= dailyStartTime) {
      return new Response(JSON.stringify({ message: "End time must be later than start time." }), { status: 400 });
    }

    if (!slotDuration || typeof slotDuration !== "number") {
      return new Response(JSON.stringify({ message: "Slot duration must be a number." }), { status: 400 });
    }

    if (slotDuration < MIN_SLOT) {
      return new Response(JSON.stringify({ message: `Slot duration must be at least ${MIN_SLOT} minutes.` }), {
        status: 400,
      });
    }

    if (slotDuration > MAX_SLOT) {
      return new Response(JSON.stringify({ message: `Slot duration cannot exceed ${MAX_SLOT} minutes.` }), {
        status: 400,
      });
    }
    
    return new Response(JSON.stringify({ message: "Validation OK — you can now save to DB" }), { status: 200 });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Server error." }), { status: 500 });
  }
}
