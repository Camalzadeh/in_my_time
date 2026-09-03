import { Poll, LIMITS } from '@/models/Poll';

import { setUpTestDatabase, validConfig } from '../helpers/db';

setUpTestDatabase();

const validPoll = {
    title: 'Project meeting',
    ownerTokenHash: 'a'.repeat(64),
    config: validConfig,
};

describe('Poll schema', () => {
    it('saves a valid poll with sensible defaults', async () => {
        const poll = await Poll.create(validPoll);

        expect(poll.status).toBe('open');
        expect(poll.votes).toEqual([]);
        expect(poll.description).toBe('');
        expect(poll.createdAt).toBeInstanceOf(Date);
    });

    it.each([
        ['title', { ...validPoll, title: undefined }],
        ['ownerTokenHash', { ...validPoll, ownerTokenHash: undefined }],
        ['config', { ...validPoll, config: undefined }],
        ['config.timezone', { ...validPoll, config: { ...validConfig, timezone: undefined } }],
        ['config.targetDates', { ...validPoll, config: { ...validConfig, targetDates: undefined } }],
    ])('requires %s', async (_field, data) => {
        await expect(Poll.create(data)).rejects.toThrow();
    });

    it('rejects a status outside the enum', async () => {
        await expect(Poll.create({ ...validPoll, status: 'cancelled' })).rejects.toThrow();
    });

    it('rejects a slot length outside the allowed range', async () => {
        await expect(
            Poll.create({ ...validPoll, config: { ...validConfig, slotDuration: 1 } }),
        ).rejects.toThrow();

        await expect(
            Poll.create({ ...validPoll, config: { ...validConfig, slotDuration: 10_000 } }),
        ).rejects.toThrow();
    });

    it('rejects a title longer than the limit', async () => {
        await expect(
            Poll.create({ ...validPoll, title: 'x'.repeat(LIMITS.TITLE_MAX + 1) }),
        ).rejects.toThrow();
    });

    it('stores days as strings, not instants', async () => {
        const poll = await Poll.create(validPoll);

        // A day is a day. Storing it as a Date is what made "the 10th" depend
        // on whichever zone happened to be running the code.
        expect(poll.config.targetDates).toEqual(['2027-03-10', '2027-03-11']);
        expect(typeof poll.config.targetDates[0]).toBe('string');
    });

    it('requires every field of an embedded vote', async () => {
        await expect(
            Poll.create({
                ...validPoll,
                votes: [{ voterId: 'a', voterName: 'A' /* no tokenHash */ }],
            }),
        ).rejects.toThrow();
    });

    it('keeps vote slots as dates', async () => {
        const poll = await Poll.create({
            ...validPoll,
            votes: [
                {
                    voterId: 'alice',
                    voterName: 'Alice',
                    tokenHash: 'b'.repeat(64),
                    selectedSlots: [new Date('2027-03-10T05:00:00.000Z')],
                },
            ],
        });

        expect(poll.votes[0].selectedSlots[0]).toBeInstanceOf(Date);
        expect(poll.votes[0].votedAt).toBeInstanceOf(Date);
    });
});
