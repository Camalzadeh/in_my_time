import { NextResponse, type NextRequest } from 'next/server';
import mongoose from 'mongoose';

import { ownerCookieName, voterCookieName } from '@/lib/auth/tokens';

interface RouteContext {
    params: Promise<{ id: string }>;
}

/**
 * Drops this browser's tokens for one poll, without touching the poll.
 *
 * It is how a poll leaves /home when deleting it is not what is wanted — a poll
 * someone else owns and you merely voted in, most of the time. Nothing is
 * removed from the database and the vote stays where it is; the browser simply
 * stops being able to prove it cast it, which is why the interface says so
 * before calling this.
 *
 * No database work and nothing to verify: throwing away your own cookie needs
 * no permission.
 */
export async function POST(_request: NextRequest, context: RouteContext) {
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ message: 'Invalid Poll ID format.' }, { status: 400 });
    }

    const response = NextResponse.json({ message: 'Removed from this device.' }, { status: 200 });

    response.cookies.delete(ownerCookieName(id));
    response.cookies.delete(voterCookieName(id));

    return response;
}
