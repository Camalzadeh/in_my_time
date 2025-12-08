import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Poll } from '@/models/Poll';
import type { IPoll, IVote } from '@/types/Poll';

interface RouteParams {
    params: Promise<{
        id: string;
    }>
}

export async function POST(req: NextRequest, { params }: RouteParams) {
    await connectDB();
    const pollId = (await params).id;

    if (!pollId) {
        return NextResponse.json({ error: 'PollId is required.' }, { status: 400 });
    }

    try {
        const body = await req.json();
        const { tempVoterId, voterName, selectedSlots } = body;

        if (!tempVoterId || !voterName || !selectedSlots || !Array.isArray(selectedSlots)) {
            return NextResponse.json({ error: 'tempVoterId, voterName, and selectedSlots are incomplete.' }, { status: 400 });
        }

        const selectedDates = selectedSlots.map((dateString: string) => new Date(dateString));
        const votedAt = new Date();

        let updatedPoll: IPoll | null = null;

        const updateAttempt = await Poll.findOneAndUpdate(
            { _id: pollId, 'votes.voterId': tempVoterId },
            {
                $set: {
                    'votes.$.selectedSlots': selectedDates,
                    'votes.$.votedAt': votedAt,
                    'votes.$.voterName': voterName,
                    'updatedAt': votedAt
                }
            },
            { new: true }
        ).exec();

        updatedPoll = updateAttempt;

        if (!updatedPoll) {

            const newVote: IVote = {
                voterId: tempVoterId,
                voterName: voterName,
                voterColor: '#000000',
                selectedSlots: selectedDates,
                votedAt: votedAt,
            };

            const pushAttempt = await Poll.findOneAndUpdate(
                { _id: pollId },
                {
                    $push: { votes: newVote },
                    $set: { updatedAt: votedAt }
                },
                { new: true }
            ).exec();

            updatedPoll = pushAttempt;
        }


        if (!updatedPoll) {
            return NextResponse.json({ error: 'Poll object not found or update failed.' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Vote successfully updated. Waiting for real-time database trigger.',
            poll: updatedPoll.toObject()
        }, { status: 200 });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
    }
}