import {NextRequest, NextResponse} from 'next/server';
import {connectDB} from '@/lib/mongodb';
import {Poll} from '@/models/Poll';
import mongoose from 'mongoose';

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function POST(
    request: NextRequest,
    context: RouteContext
) {
    const { id } = await context.params;
    const pollId = id;
    try {
        const { status, finalDate } = await request.json();

        if (status !== 'closed' || !finalDate) {
            return NextResponse.json({ message: "Invalid payload: status must be 'closed' and finalDate required" }, { status: 400 });
        }

        await connectDB();

        const poll = await Poll.findById(pollId);

        if (!poll) {
            return NextResponse.json({ message: "Poll not found" }, { status: 404 });
        }

        const updatedPoll = await Poll.findByIdAndUpdate(
            pollId,
            {
                status: 'finalized',
                finalTime: finalDate,
                updatedAt: new Date(),
            },
            { new: true }
        );

        if (!updatedPoll) {
            return NextResponse.json({ message: "Poll update failed" }, { status: 500 });
        }

        return NextResponse.json(
            { message: "Poll finalized successfully", poll: updatedPoll },
            { status: 200 }
        );

    } catch (error) {
        console.error("API Error during finalization:", error);

        if (error instanceof mongoose.Error.CastError) {
            return NextResponse.json({ message: "Invalid Poll ID format" }, { status: 400 });
        }

        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }

}