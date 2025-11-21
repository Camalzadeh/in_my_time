import {NextRequest, NextResponse} from 'next/server';
import {connectDB} from '@/lib/mongodb';
import {Poll} from '@/models/Poll';
import mongoose from 'mongoose';

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(
    request: NextRequest,
    context: RouteContext
) {
    const { id } = await context.params;
    const pollId = id;
    await connectDB();

    console.log("Parameter received in API (pollId):", pollId);

    if (!mongoose.Types.ObjectId.isValid(pollId)) {
        return NextResponse.json({message: 'Invalid Poll ID format.'}, {status: 400});
    }

    try {
        const poll = await Poll.findById(pollId);

        if (!poll) {
            return NextResponse.json({message: 'Poll not found.'}, {status: 404});
        }

        return NextResponse.json(poll, {status: 200});

    } catch (error) {
        console.error("Error fetching poll:", error);
        return NextResponse.json(
            {message: 'Server error: Could not retrieve poll data.'},
            {status: 500}
        );
    }
}