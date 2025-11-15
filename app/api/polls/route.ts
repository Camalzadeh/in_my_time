import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Poll from '@/models/Poll';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("2. Incoming Data (Body):", body);

        await connectDB();
        console.log("3. MongoDB connection successful.");

        const { title, description, availableDates, ownerId } = body;

        if (!title || !availableDates || availableDates.length === 0 || !ownerId) {
            return NextResponse.json(
                { message: 'Title, dates, and owner ID (ownerId) are required.' },
                { status: 400 }
            );
        }

        const newPoll = await Poll.create({
            title,
            description: description || '',
            availableDates,
            ownerId
        });

        console.log("4. Data saved successfully.");

        return NextResponse.json(
            {
                message: 'Poll created successfully.',
                pollId: newPoll._id,
                shareUrl: `/poll/${newPoll._id}`
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("CRITICAL SERVER ERROR:", error);
        return NextResponse.json(
            { message: 'Server error: Could not create poll.', detail: (error as Error).message },
            { status: 500 }
        );
    }
}