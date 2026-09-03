import type { IPoll, IVote, IPollConfig } from '@/types/Poll';

// The boundary between the server's shape and the browser's shape.
//
// The old code did `NextResponse.json(poll)`, so whatever the document held
// went out. `ownerId` leaked that way, and that leak was the root of the
// authorization hole. Only the fields below reach the browser now; adding a new
// secret to the model no longer risks publishing it by default.

export interface PublicVote {
    voterId: string;
    voterName: string;
    /** ISO-8601 strings, since JSON has no Date. */
    selectedSlots: string[];
    votedAt: string;
}

export interface PublicPoll {
    _id: string;
    title: string;
    description: string;
    config: IPollConfig;
    votes: PublicVote[];
    status: 'open' | 'finalized';
    finalTime: string | null;
    createdAt: string;
    updatedAt: string;
}

const iso = (value: Date | string | undefined | null): string =>
    value instanceof Date ? value.toISOString() : String(value ?? '');

export function toPublicVote(vote: IVote): PublicVote {
    // tokenHash is deliberately absent.
    return {
        voterId: vote.voterId,
        voterName: vote.voterName,
        selectedSlots: (vote.selectedSlots ?? []).map(iso),
        votedAt: iso(vote.votedAt),
    };
}

export function toPublicPoll(poll: IPoll): PublicPoll {
    // ownerTokenHash and votes[].tokenHash are deliberately absent.
    return {
        _id: String(poll._id),
        title: poll.title,
        description: poll.description ?? '',
        config: {
            targetDates: [...(poll.config?.targetDates ?? [])],
            dailyStartTime: poll.config?.dailyStartTime ?? '',
            dailyEndTime: poll.config?.dailyEndTime ?? '',
            slotDuration: poll.config?.slotDuration ?? 0,
            timezone: poll.config?.timezone ?? 'UTC',
        },
        votes: (poll.votes ?? []).map(toPublicVote),
        status: poll.status,
        finalTime: poll.finalTime ? iso(poll.finalTime) : null,
        createdAt: iso(poll.createdAt),
        updatedAt: iso(poll.updatedAt),
    };
}
