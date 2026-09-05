import { NextResponse, type NextRequest } from 'next/server';
import mongoose from 'mongoose';

import { connectDB } from '@/lib/mongodb';
import { Poll } from '@/models/Poll';
import { toPublicPoll } from '@/lib/data/serialize';
import type { IPoll } from '@/types/Poll';
import { ownerCookieName, voterCookieName, tokenMatchesHash } from '@/lib/auth/tokens';

interface RouteContext {
    params: Promise<{ id: string }>;
}

/**
 * Existence check for the "open a poll by ID" box.
 *
 * Without this, Next answers HEAD by running GET and discarding the body — so
 * checking whether an id is valid read the whole poll, votes included.
 */
export async function HEAD(_request: Request, context: RouteContext) {
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return new Response(null, { status: 400 });
    }

    try {
        await connectDB();
        const exists = await Poll.exists({ _id: id });

        return new Response(null, { status: exists ? 200 : 404 });
    } catch (error) {
        console.error('[polls] existence check failed', { id, error });
        return new Response(null, { status: 500 });
    }
}

export async function GET(_request: Request, context: RouteContext) {
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ message: 'Invalid Poll ID format.' }, { status: 400 });
    }

    try {
        await connectDB();

        const poll = await Poll.findById(id).lean<IPoll>();

        if (!poll) {
            return NextResponse.json({ message: 'Poll not found.' }, { status: 404 });
        }

        // Through the serializer rather than raw, so ownerTokenHash and the
        // per-vote token hashes stay on the server.
        return NextResponse.json(toPublicPoll(poll), { status: 200 });
    } catch (error) {
        console.error('[polls] read failed', { id, error });
        return NextResponse.json({ message: 'Could not retrieve poll data.' }, { status: 500 });
    }
}

/**
 * Deletes a poll. Only its owner may, and only by holding the token.
 *
 * There was no way to delete a poll at all, so the only way to be rid of one
 * was to ask whoever runs the database. It is gone for everybody, votes
 * included, and it cannot be undone — the interface asks before calling this.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ message: 'Invalid Poll ID format.' }, { status: 400 });
    }

    try {
        await connectDB();

        const poll = await Poll.findById(id).select('ownerTokenHash').lean<IPoll>();

        if (!poll) {
            return NextResponse.json({ message: 'Poll not found.' }, { status: 404 });
        }

        const ownerToken = request.cookies.get(ownerCookieName(id))?.value;

        if (!tokenMatchesHash(ownerToken, poll.ownerTokenHash)) {
            // Deliberately not 404: the poll is real, and saying so tells the
            // caller nothing they did not already have by holding its id.
            return NextResponse.json(
                { message: 'Only the person who created this poll can delete it.' },
                { status: 403 },
            );
        }

        await Poll.deleteOne({ _id: id });

        const response = NextResponse.json({ message: 'Poll deleted.' }, { status: 200 });

        // The tokens are worthless now, and leaving them would keep the poll
        // listed on /home until they expired.
        response.cookies.delete(ownerCookieName(id));
        response.cookies.delete(voterCookieName(id));

        return response;
    } catch (error) {
        console.error('[polls] delete failed', { id, error });
        return NextResponse.json({ message: 'Could not delete the poll.' }, { status: 500 });
    }
}
