// Importing this from a client component is a build error, not a runtime one.
import 'server-only';

import { cache } from 'react';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';

import { connectDB } from '@/lib/mongodb';
import { Poll } from '@/models/Poll';
import type { IPoll } from '@/types/Poll';
import {
    ownerCookieName,
    voterCookieName,
    pollIdsFromCookieNames,
    tokenMatchesHash,
} from '@/lib/auth/tokens';

// What /home is built from.
//
// There are no accounts here, so "my polls" can only mean "the polls this
// browser can prove something about". Proof is the per-poll httpOnly token: the
// one handed out when a poll is created, and the one handed out when a vote is
// first saved. Nothing in this file trusts anything the page sends.

export interface PollSummary {
    id: string;
    title: string;
    status: 'open' | 'finalized';
    participantCount: number;
    dayCount: number;
    slotDuration: number;
    /** The zone the poll was written in. */
    timezone: string;
    /** "YYYY-MM-DD", the poll's own days. */
    firstDate: string | null;
    lastDate: string | null;
    finalTime: string | null;
    createdAt: string;
    /** True when the ownership token still checks out. */
    isOwner: boolean;
    /** The name this browser voted under, when it has. */
    votedAs: string | null;
}

export interface MyPolls {
    created: PollSummary[];
    voted: PollSummary[];
}

const EMPTY: MyPolls = { created: [], voted: [] };

/** Guards against a poll with hundreds of cookies turning /home into a scan. */
const MAX_POLLS = 100;

function summarise(poll: IPoll, isOwner: boolean, votedAs: string | null): PollSummary {
    const dates = [...(poll.config?.targetDates ?? [])].sort();

    return {
        id: String(poll._id),
        title: poll.title,
        status: poll.status,
        participantCount: poll.votes?.length ?? 0,
        dayCount: dates.length,
        slotDuration: poll.config?.slotDuration ?? 0,
        timezone: poll.config?.timezone ?? 'UTC',
        firstDate: dates[0] ?? null,
        lastDate: dates[dates.length - 1] ?? null,
        finalTime: poll.finalTime ? new Date(poll.finalTime).toISOString() : null,
        createdAt: new Date(poll.createdAt).toISOString(),
        isOwner,
        votedAs,
    };
}

/**
 * The whole of the logic, over a plain list of cookies.
 *
 * Split out from `getMyPolls` so a test can hand it a forged cookie list: the
 * property worth pinning down is that a poll id alone gets you nothing, and
 * that is invisible if the only way in is a real request.
 */
export async function buildMyPolls(cookieList: { name: string; value: string }[]): Promise<MyPolls> {
    const tokens = new Map(cookieList.map((cookie) => [cookie.name, cookie.value]));
    const { owned, voted } = pollIdsFromCookieNames([...tokens.keys()]);

    const ids = [...new Set([...owned, ...voted])]
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .slice(0, MAX_POLLS);

    if (ids.length === 0) return EMPTY;

    await connectDB();

    // selectedSlots is deliberately left out: a listing needs counts and names,
    // and those arrays are the bulk of a poll.
    const polls = await Poll.find({ _id: { $in: ids } })
        .select('title status config createdAt finalTime ownerTokenHash votes.voterName votes.tokenHash')
        .lean<IPoll[]>();

    const created: PollSummary[] = [];
    const participated: PollSummary[] = [];

    for (const poll of polls) {
        const id = String(poll._id);

        const isOwner = tokenMatchesHash(tokens.get(ownerCookieName(id)), poll.ownerTokenHash);

        // Which vote belongs to this browser is decided by the token, not by
        // any id the browser claims.
        const voterToken = tokens.get(voterCookieName(id));
        const myVote = voterToken
            ? (poll.votes ?? []).find((vote) => tokenMatchesHash(voterToken, vote.tokenHash))
            : undefined;

        const summary = summarise(poll, isOwner, myVote?.voterName ?? null);

        // A poll you made and also voted in belongs under "created" — listing it
        // twice would only make the page longer.
        if (isOwner) created.push(summary);
        else if (myVote) participated.push(summary);
    }

    const newestFirst = (a: PollSummary, b: PollSummary) => b.createdAt.localeCompare(a.createdAt);

    return {
        created: created.sort(newestFirst),
        voted: participated.sort(newestFirst),
    };
}

/** Wrapped in `cache` so a layout and a page asking for it is still one query. */
export const getMyPolls = cache(async (): Promise<MyPolls> => {
    const store = await cookies();
    return buildMyPolls(store.getAll().map((cookie) => ({ name: cookie.name, value: cookie.value })));
});
