import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

import { connectDB } from '@/lib/mongodb';
import { Poll } from '@/models/Poll';
import type { IPoll } from '@/types/Poll';
import { finalizeSchema, firstIssue } from '@/lib/validation';
import { publishPollEvent } from '@/lib/realtime';
import { tokenMatchesHash, ownerCookieName } from '@/lib/auth/tokens';
import { generateSlots } from '@/lib/time/slots';

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
    const { id: pollId } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(pollId)) {
        return NextResponse.json({ message: 'Invalid Poll ID format.' }, { status: 400 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ message: 'Request body is not valid JSON.' }, { status: 400 });
    }

    const parsed = finalizeSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ message: firstIssue(parsed.error) }, { status: 400 });
    }

    const { finalSlot } = parsed.data;

    try {
        await connectDB();

        const poll = await Poll.findById(pollId).lean<IPoll>();
        if (!poll) {
            return NextResponse.json({ message: 'Poll not found.' }, { status: 404 });
        }

        // This check did not exist at all. Because `ownerId` came back in the
        // poll's public JSON, anyone holding the link could read it and close
        // any poll they liked.
        const ownerToken = request.cookies.get(ownerCookieName(pollId))?.value;

        if (!tokenMatchesHash(ownerToken, poll.ownerTokenHash)) {
            return NextResponse.json(
                { message: 'Only the person who created this poll can close it.' },
                { status: 403 },
            );
        }

        if (poll.status !== 'open') {
            return NextResponse.json({ message: 'This poll is already closed.' }, { status: 409 });
        }

        const finalDate = new Date(finalSlot);
        const validSlots = new Set(generateSlots(poll.config).map((slot) => slot.toISOString()));

        if (!validSlots.has(finalDate.toISOString())) {
            return NextResponse.json(
                { message: 'That time does not belong to this poll.' },
                { status: 400 },
            );
        }

        // The `status: 'open'` condition makes a second close atomic-safe.
        const updated = await Poll.findOneAndUpdate(
            { _id: pollId, status: 'open' },
            { $set: { status: 'finalized', finalTime: finalDate } },
            { new: true },
        ).lean<IPoll>();

        if (!updated) {
            return NextResponse.json({ message: 'This poll is already closed.' }, { status: 409 });
        }

        await publishPollEvent(pollId, { type: 'finalized', finalTime: finalDate.toISOString() });

        return NextResponse.json(
            { status: 'finalized', finalTime: finalDate.toISOString() },
            { status: 200 },
        );
    } catch (error) {
        console.error('[finalize] failed', { pollId, error });
        return NextResponse.json({ message: 'Could not close the poll.' }, { status: 500 });
    }
}
