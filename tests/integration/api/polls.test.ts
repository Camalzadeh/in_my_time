import { POST as createPoll } from '@/app/api/polls/route';
import { Poll } from '@/models/Poll';
import { ownerCookieName } from '@/lib/auth/tokens';

import { setUpTestDatabase, validConfig } from '../helpers/db';

setUpTestDatabase();

const create = (body: unknown) =>
    createPoll(
        new Request('http://localhost/api/polls', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body),
        }),
    );

describe('POST /api/polls', () => {
    it('creates a poll and sets an owner cookie', async () => {
        const response = await create({ title: 'Sprint review', config: validConfig });
        const body = await response.json();

        expect(response.status).toBe(201);
        expect(body.pollId).toEqual(expect.any(String));

        const cookie = response.cookies.get(ownerCookieName(body.pollId));
        expect(cookie?.value).toEqual(expect.any(String));
        expect(cookie?.httpOnly).toBe(true);
    });

    it('stores the hash of the owner token, never the token', async () => {
        const response = await create({ title: 'Sprint review', config: validConfig });
        const { pollId } = await response.json();
        const token = response.cookies.get(ownerCookieName(pollId))!.value;

        const poll = await Poll.findById(pollId).lean();

        expect(poll!.ownerTokenHash).toHaveLength(64);
        expect(poll!.ownerTokenHash).not.toBe(token);
    });

    it('keeps the time zone, without which the slots mean nothing', async () => {
        const response = await create({ title: 'x', config: validConfig });
        const { pollId } = await response.json();

        const poll = await Poll.findById(pollId).lean();
        expect(poll!.config.timezone).toBe('Asia/Baku');
    });

    it('deduplicates and sorts the days', async () => {
        const response = await create({
            title: 'x',
            config: { ...validConfig, targetDates: ['2027-03-11', '2027-03-10', '2027-03-11'] },
        });
        const { pollId } = await response.json();

        const poll = await Poll.findById(pollId).lean();
        expect(poll!.config.targetDates).toEqual(['2027-03-10', '2027-03-11']);
    });

    // This returned 500 before, so a user saw "Server error" for their own typo.
    it('answers 400 for a date that does not exist', async () => {
        const response = await create({
            title: 'x',
            config: { ...validConfig, targetDates: ['2027-02-31'] },
        });

        expect(response.status).toBe(400);
    });

    it.each([
        ['a missing title', { config: validConfig }],
        ['no days', { title: 'x', config: { ...validConfig, targetDates: [] } }],
        ['an unknown time zone', { title: 'x', config: { ...validConfig, timezone: 'Mars/Olympus' } }],
        ['an end before the start', { title: 'x', config: { ...validConfig, dailyEndTime: '08:00' } }],
        ['a zero slot length', { title: 'x', config: { ...validConfig, slotDuration: 0 } }],
        ['too many days', {
            title: 'x',
            config: {
                ...validConfig,
                targetDates: Array.from({ length: 61 }, (_, i) =>
                    new Date(Date.UTC(2027, 2, 1 + i)).toISOString().slice(0, 10)),
            },
        }],
    ])('answers 400 for %s', async (_label, body) => {
        expect((await create(body)).status).toBe(400);
    });

    it('answers 400 for a body that is not JSON', async () => {
        const response = await createPoll(
            new Request('http://localhost/api/polls', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: 'not json',
            }),
        );

        expect(response.status).toBe(400);
    });
});
