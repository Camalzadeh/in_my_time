import { applyPollEvent, isPollEvent, pollChannelName } from '@/lib/poll-state';
import type { PublicPoll, PublicVote } from '@/lib/data/serialize';

const vote = (voterId: string, name: string, slots: string[] = []): PublicVote => ({
    voterId,
    voterName: name,
    selectedSlots: slots,
    votedAt: '2027-03-01T00:00:00.000Z',
});

const basePoll: PublicPoll = {
    _id: 'p1',
    title: 'Test',
    description: '',
    config: {
        targetDates: ['2027-03-10'],
        dailyStartTime: '09:00',
        dailyEndTime: '12:00',
        slotDuration: 60,
        timezone: 'Asia/Baku',
    },
    votes: [vote('alice', 'Alice', ['2027-03-10T05:00:00.000Z'])],
    status: 'open',
    finalTime: null,
    createdAt: '2027-03-01T00:00:00.000Z',
    updatedAt: '2027-03-01T00:00:00.000Z',
};

describe('applyPollEvent', () => {
    it('adds a vote from someone new', () => {
        const next = applyPollEvent(basePoll, { type: 'vote', vote: vote('bob', 'Bob') });

        expect(next.votes).toHaveLength(2);
        expect(next.votes[1].voterName).toBe('Bob');
    });

    it('replaces an existing vote in place', () => {
        const updated = vote('alice', 'Alice', ['2027-03-10T06:00:00.000Z']);
        const next = applyPollEvent(basePoll, { type: 'vote', vote: updated });

        expect(next.votes).toHaveLength(1);
        expect(next.votes[0].selectedSlots).toEqual(['2027-03-10T06:00:00.000Z']);
    });

    it('removes a cleared vote', () => {
        const next = applyPollEvent(basePoll, { type: 'vote-cleared', voterId: 'alice' });
        expect(next.votes).toHaveLength(0);
    });

    it('returns the same object when clearing a vote that is not there', () => {
        const next = applyPollEvent(basePoll, { type: 'vote-cleared', voterId: 'nobody' });
        expect(next).toBe(basePoll);
    });

    it('marks the poll finalized', () => {
        const next = applyPollEvent(basePoll, {
            type: 'finalized',
            finalTime: '2027-03-10T05:00:00.000Z',
        });

        expect(next.status).toBe('finalized');
        expect(next.finalTime).toBe('2027-03-10T05:00:00.000Z');
    });

    it('never mutates the poll it was given', () => {
        const before = JSON.stringify(basePoll);
        applyPollEvent(basePoll, { type: 'vote', vote: vote('bob', 'Bob') });
        expect(JSON.stringify(basePoll)).toBe(before);
    });
});

describe('isPollEvent', () => {
    it('accepts the events we publish', () => {
        expect(isPollEvent({ type: 'vote', vote: vote('a', 'A') })).toBe(true);
        expect(isPollEvent({ type: 'vote-cleared', voterId: 'a' })).toBe(true);
        expect(isPollEvent({ type: 'finalized', finalTime: 'x' })).toBe(true);
    });

    it('rejects anything else off the channel', () => {
        expect(isPollEvent(null)).toBe(false);
        expect(isPollEvent('vote')).toBe(false);
        expect(isPollEvent({ type: 'unknown' })).toBe(false);
        expect(isPollEvent({ type: 'vote' })).toBe(false);
        expect(isPollEvent({ type: 'vote', vote: { voterId: 1 } })).toBe(false);
        expect(isPollEvent({ type: 'vote-cleared' })).toBe(false);
    });
});

describe('pollChannelName', () => {
    it('matches the name the server publishes to', () => {
        expect(pollChannelName('abc')).toBe('poll-abc-updates');
    });
});
