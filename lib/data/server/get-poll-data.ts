// Importing this from a client component is a build error, not a runtime one.
// A constant used to be exported from models/Poll.ts, a form imported it, and
// mongoose came along for the ride — the page server-rendered fine and then
// threw `Cannot read properties of undefined (reading 'Poll')` on hydration.
import 'server-only';

import { cache } from 'react';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';

import { connectDB } from '@/lib/mongodb';
import { Poll } from '@/models/Poll';
import type { IPoll } from '@/types/Poll';
import { toPublicPoll, type PublicPoll } from '@/lib/data/serialize';
import { tokenMatchesHash, ownerCookieName } from '@/lib/auth/tokens';
import { isRealtimeConfigured } from '@/lib/realtime';

export interface PollPageData {
    poll: PublicPoll;
    /** Decided on the server from the cookie. The browser's claim is not trusted. */
    isOwner: boolean;
    /** With Ably unconfigured the UI should not promise live updates. */
    realtimeEnabled: boolean;
}

/**
 * Everything the poll page needs. Runs on the server and reads the database
 * directly.
 *
 * It does not call our own API over HTTPS: that cost a second serverless
 * invocation and a full TLS round trip for every poll page.
 *
 * Wrapped in `cache` because both `generateMetadata` and the page itself need
 * this, and without it every poll view was two identical queries.
 */
export const getPollPageData = cache(
    async (pollId: string): Promise<PollPageData | null> => {
        if (!mongoose.Types.ObjectId.isValid(pollId)) return null;

        await connectDB();

        const poll = await Poll.findById(pollId).lean<IPoll>();
        if (!poll) return null;

        const cookieStore = await cookies();
        const ownerToken = cookieStore.get(ownerCookieName(pollId))?.value;

        return {
            poll: toPublicPoll(poll),
            isOwner: tokenMatchesHash(ownerToken, poll.ownerTokenHash),
            realtimeEnabled: isRealtimeConfigured(),
        };
    },
);
