import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

import { connectDB } from '@/lib/mongodb';
import { Poll } from '@/models/Poll';
import type { IPoll, IVote } from '@/types/Poll';
import { voteSchema, clearVoteSchema, firstIssue } from '@/lib/validation';
import { toPublicVote } from '@/lib/data/serialize';
import { publishPollEvent } from '@/lib/realtime';
import {
    createToken,
    hashToken,
    tokenMatchesHash,
    ownerCookieName,
    voterCookieName,
    attachToken,
} from '@/lib/auth/tokens';
import { generateSlots } from '@/lib/time/slots';

interface RouteContext {
    params: Promise<{ id: string }>;
}

type VoteWrite = Pick<IVote, 'voterId' | 'voterName' | 'selectedSlots' | 'votedAt'> & {
    tokenHash: string;
};

/**
 * Writes the vote atomically.
 *
 * The old code looked for an existing vote and then `$push`ed if it found
 * none — with a gap in between, so two concurrent requests could create *two*
 * entries for the same voterId. Here the push is conditional on
 * `votes.voterId: {$ne: ...}`, so a second concurrent request matches no
 * document and does nothing.
 */
async function writeVote(
    pollId: string,
    vote: VoteWrite,
): Promise<{ poll: IPoll | null; conflict: boolean }> {
    const fields = {
        'votes.$.voterName': vote.voterName,
        'votes.$.selectedSlots': vote.selectedSlots,
        'votes.$.votedAt': vote.votedAt,
    };

    const updated = await Poll.findOneAndUpdate(
        { _id: pollId, 'votes.voterId': vote.voterId },
        { $set: fields },
        { new: true },
    ).lean<IPoll>();

    if (updated) return { poll: updated, conflict: false };

    const pushed = await Poll.findOneAndUpdate(
        { _id: pollId, 'votes.voterId': { $ne: vote.voterId } },
        { $push: { votes: vote } },
        { new: true },
    ).lean<IPoll>();

    if (pushed) return { poll: pushed, conflict: false };

    // Neither the update nor the push matched. Either the poll is gone, or a
    // concurrent request got there first and created the vote with its own
    // token — in which case ours would not authenticate.
    const exists = await Poll.exists({ _id: pollId });
    return { poll: null, conflict: Boolean(exists) };
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

    const parsed = voteSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ message: firstIssue(parsed.error) }, { status: 400 });
    }

    const { voterId, voterName, selectedSlots } = parsed.data;

    try {
        await connectDB();

        const poll = await Poll.findById(pollId).lean<IPoll>();
        if (!poll) {
            return NextResponse.json({ message: 'Poll not found.' }, { status: 404 });
        }

        if (poll.status !== 'open') {
            return NextResponse.json({ message: 'This poll is closed.' }, { status: 409 });
        }

        // The chosen slots have to be slots this poll actually offers. Before,
        // any timestamp at all was accepted and stored verbatim.
        const validSlots = new Set(generateSlots(poll.config).map((slot) => slot.toISOString()));
        const unknown = selectedSlots.find((slot) => !validSlots.has(new Date(slot).toISOString()));

        if (unknown) {
            return NextResponse.json(
                { message: 'One of the selected times does not belong to this poll.' },
                { status: 400 },
            );
        }

        const existing = poll.votes.find((vote) => vote.voterId === voterId);

        const voterToken = request.cookies.get(voterCookieName(pollId))?.value;
        const ownerToken = request.cookies.get(ownerCookieName(pollId))?.value;
        const isOwner = tokenMatchesHash(ownerToken, poll.ownerTokenHash);

        // An existing vote may only be changed by whoever cast it, or by the
        // poll's owner.
        if (existing && !tokenMatchesHash(voterToken, existing.tokenHash) && !isOwner) {
            return NextResponse.json(
                { message: 'You are not allowed to change this vote.' },
                { status: 403 },
            );
        }

        // Keep the existing vote's token: when the owner edits someone else's
        // vote we must not lock that person out of their own.
        const issuedToken = existing ? null : createToken();
        const tokenHash = existing ? existing.tokenHash : hashToken(issuedToken!);

        const { poll: updatedPoll, conflict } = await writeVote(pollId, {
            voterId,
            voterName,
            tokenHash,
            selectedSlots: selectedSlots.map((slot) => new Date(slot)),
            votedAt: new Date(),
        });

        if (conflict) {
            return NextResponse.json(
                { message: 'The vote was written elsewhere at the same time. Try again.' },
                { status: 409 },
            );
        }

        if (!updatedPoll) {
            return NextResponse.json({ message: 'Poll not found.' }, { status: 404 });
        }

        const savedVote = updatedPoll.votes.find((vote) => vote.voterId === voterId);
        if (!savedVote) {
            return NextResponse.json({ message: 'Could not save the vote.' }, { status: 500 });
        }

        const publicVote = toPublicVote(savedVote);

        // Publishing cannot fail the request — the vote is already stored.
        await publishPollEvent(pollId, { type: 'vote', vote: publicVote });

        const response = NextResponse.json({ vote: publicVote }, { status: 200 });

        if (issuedToken) {
            attachToken(response, voterCookieName(pollId), issuedToken);
        }

        return response;
    } catch (error) {
        console.error('[vote] write failed', { pollId, error });
        return NextResponse.json({ message: 'Could not save the vote.' }, { status: 500 });
    }
}

/** Clears a vote. Anyone may clear their own; only the owner may clear another's. */
export async function DELETE(request: NextRequest, context: RouteContext) {
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

    const parsed = clearVoteSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ message: firstIssue(parsed.error) }, { status: 400 });
    }

    const { voterId } = parsed.data;

    try {
        await connectDB();

        const poll = await Poll.findById(pollId).lean<IPoll>();
        if (!poll) {
            return NextResponse.json({ message: 'Poll not found.' }, { status: 404 });
        }

        if (poll.status !== 'open') {
            return NextResponse.json({ message: 'This poll is closed.' }, { status: 409 });
        }

        const existing = poll.votes.find((vote) => vote.voterId === voterId);
        if (!existing) {
            return NextResponse.json({ message: 'Vote not found.' }, { status: 404 });
        }

        const voterToken = request.cookies.get(voterCookieName(pollId))?.value;
        const ownerToken = request.cookies.get(ownerCookieName(pollId))?.value;

        const allowed =
            tokenMatchesHash(voterToken, existing.tokenHash) ||
            tokenMatchesHash(ownerToken, poll.ownerTokenHash);

        if (!allowed) {
            return NextResponse.json(
                { message: 'You are not allowed to clear this vote.' },
                { status: 403 },
            );
        }

        await Poll.updateOne({ _id: pollId }, { $pull: { votes: { voterId } } });

        await publishPollEvent(pollId, { type: 'vote-cleared', voterId });

        return NextResponse.json({ voterId }, { status: 200 });
    } catch (error) {
        console.error('[vote] clear failed', { pollId, error });
        return NextResponse.json({ message: 'Could not clear the vote.' }, { status: 500 });
    }
}
