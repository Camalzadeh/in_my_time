import { notFound } from "next/navigation";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { Poll } from "@/models/Poll";

// This runs on the server, so it reads the database directly. Going through
// /api/polls/:id would cost a second serverless invocation and a full HTTPS
// round trip to our own domain for every poll page.
export async function getPollDataServer(pollId: string) {
    if (!mongoose.Types.ObjectId.isValid(pollId)) {
        return notFound();
    }

    await connectDB();

    const poll = await Poll.findById(pollId).lean();

    if (!poll) {
        return notFound();
    }

    // Same shape the API route returned: ObjectIds and Dates become strings, so
    // the client component still receives serialisable props.
    return JSON.parse(JSON.stringify(poll));
}
