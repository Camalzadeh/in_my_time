import type { PublicPoll, PublicVote } from '@/lib/data/serialize';

// Applying realtime events to poll state.
//
// The channel used to carry the whole poll document and the client just did
// `setPoll(message.data)`. Two consequences: the message grew with the vote
// count, and a message that arrived late could roll newer state backwards. The
// channel now carries only what changed, and applying it is this pure function
// — which is why it can be tested.

export type PollEvent =
    | { type: 'vote'; vote: PublicVote }
    | { type: 'vote-cleared'; voterId: string }
    | { type: 'finalized'; finalTime: string };

// The channel and event names are needed on the server (to publish) and in the
// browser (to subscribe). They live here so a client component can import them
// without pulling in `lib/realtime.ts`, which drags along Ably's server SDK.
export const pollChannelName = (pollId: string) => `poll-${pollId}-updates`;

export const POLL_EVENT = 'update';

export function applyPollEvent(poll: PublicPoll, event: PollEvent): PublicPoll {
    switch (event.type) {
        case 'vote': {
            const index = poll.votes.findIndex((v) => v.voterId === event.vote.voterId);

            const votes =
                index === -1
                    ? [...poll.votes, event.vote]
                    : poll.votes.map((v, i) => (i === index ? event.vote : v));

            return { ...poll, votes };
        }

        case 'vote-cleared': {
            const votes = poll.votes.filter((v) => v.voterId !== event.voterId);

            // Return the same object when nothing changed, to skip a render.
            return votes.length === poll.votes.length ? poll : { ...poll, votes };
        }

        case 'finalized':
            return { ...poll, status: 'finalized', finalTime: event.finalTime };

        default:
            return poll;
    }
}

/** Whether something off the channel has the shape we expect. */
export function isPollEvent(value: unknown): value is PollEvent {
    if (!value || typeof value !== 'object') return false;

    const event = value as Record<string, unknown>;

    switch (event.type) {
        case 'vote': {
            const vote = event.vote as PublicVote | undefined;
            return Boolean(
                vote && typeof vote.voterId === 'string' && Array.isArray(vote.selectedSlots),
            );
        }
        case 'vote-cleared':
            return typeof event.voterId === 'string';
        case 'finalized':
            return typeof event.finalTime === 'string';
        default:
            return false;
    }
}
