import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

import { connectDB } from '@/lib/mongodb';
import { Poll } from '@/models/Poll';
import { toPublicPoll } from '@/lib/data/serialize';
import type { IPoll } from '@/types/Poll';

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
