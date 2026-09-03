import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

import { connectDB } from '@/lib/mongodb';
import { Poll } from '@/models/Poll';
import { toPublicPoll } from '@/lib/data/serialize';
import type { IPoll } from '@/types/Poll';

interface RouteContext {
    params: Promise<{ id: string }>;
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
