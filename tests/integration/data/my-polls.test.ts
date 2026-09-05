import { Poll } from '@/models/Poll';
import { buildMyPolls } from '@/lib/data/server/get-my-polls';
import { createToken, hashToken, ownerCookieName, voterCookieName } from '@/lib/auth/tokens';

import { setUpTestDatabase, validConfig, FIRST_SLOT } from '../helpers/db';

setUpTestDatabase();

/** A poll plus the tokens whoever made it and voted in it would be holding. */
async function seedPoll(title: string) {
    const ownerToken = createToken();
    const voterToken = createToken();

    const poll = await Poll.create({
        title,
        ownerTokenHash: hashToken(ownerToken),
        config: validConfig,
        votes: [
            {
                voterId: 'browser-uuid-1',
                voterName: 'Aysel',
                tokenHash: hashToken(voterToken),
                selectedSlots: [new Date(FIRST_SLOT)],
            },
        ],
    });

    return { id: poll._id.toString(), ownerToken, voterToken };
}

const cookie = (name: string, value: string) => ({ name, value });

describe('buildMyPolls', () => {
    it('returns nothing when the browser holds no tokens', async () => {
        await seedPoll('Someone else’s poll');

        expect(await buildMyPolls([])).toEqual({ created: [], voted: [] });
    });

    it('lists a poll under "created" for whoever holds the owner token', async () => {
        const { id, ownerToken } = await seedPoll('Team sync');

        const result = await buildMyPolls([cookie(ownerCookieName(id), ownerToken)]);

        expect(result.voted).toEqual([]);
        expect(result.created).toHaveLength(1);
        expect(result.created[0]).toMatchObject({
            id,
            title: 'Team sync',
            status: 'open',
            isOwner: true,
            participantCount: 1,
            dayCount: 2,
        });
    });

    it('lists a poll under "voted" for whoever holds the voter token', async () => {
        const { id, voterToken } = await seedPoll('Book club');

        const result = await buildMyPolls([cookie(voterCookieName(id), voterToken)]);

        expect(result.created).toEqual([]);
        expect(result.voted).toHaveLength(1);
        expect(result.voted[0]).toMatchObject({ id, isOwner: false, votedAs: 'Aysel' });
    });

    it('shows a poll once when the owner also voted in it', async () => {
        const { id, ownerToken, voterToken } = await seedPoll('My own poll');

        const result = await buildMyPolls([
            cookie(ownerCookieName(id), ownerToken),
            cookie(voterCookieName(id), voterToken),
        ]);

        expect(result.voted).toEqual([]);
        expect(result.created).toHaveLength(1);
        expect(result.created[0]).toMatchObject({ isOwner: true, votedAs: 'Aysel' });
    });

    // The point of the whole design. Poll ids travel in links and voter ids are
    // published in every poll's JSON, so neither may be enough to enumerate
    // somebody's polls.
    it('ignores a cookie whose token does not match', async () => {
        const { id } = await seedPoll('Private plans');

        const result = await buildMyPolls([
            cookie(ownerCookieName(id), createToken()),
            cookie(voterCookieName(id), createToken()),
        ]);

        expect(result).toEqual({ created: [], voted: [] });
    });

    it('ignores an id that is not a poll id at all', async () => {
        const result = await buildMyPolls([
            cookie(ownerCookieName('not-an-object-id'), createToken()),
        ]);

        expect(result).toEqual({ created: [], voted: [] });
    });

    it('skips a token for a poll that no longer exists', async () => {
        const { id, ownerToken } = await seedPoll('Deleted later');
        await Poll.deleteMany({});

        expect(await buildMyPolls([cookie(ownerCookieName(id), ownerToken)])).toEqual({
            created: [],
            voted: [],
        });
    });

    it('puts the newest poll first', async () => {
        const first = await seedPoll('Older');
        // createdAt has millisecond resolution, and both writes land inside one.
        await Poll.updateOne(
            { _id: first.id },
            { $set: { createdAt: new Date('2026-01-01T00:00:00.000Z') } },
            { timestamps: false },
        );
        const second = await seedPoll('Newer');

        const result = await buildMyPolls([
            cookie(ownerCookieName(first.id), first.ownerToken),
            cookie(ownerCookieName(second.id), second.ownerToken),
        ]);

        expect(result.created.map((poll) => poll.title)).toEqual(['Newer', 'Older']);
    });

    it('does not carry any secret into the summary', async () => {
        const { id, ownerToken } = await seedPoll('Team sync');

        const [summary] = (await buildMyPolls([cookie(ownerCookieName(id), ownerToken)])).created;
        const serialised = JSON.stringify(summary);

        expect(serialised).not.toContain(ownerToken);
        expect(serialised).not.toContain('tokenHash');
        expect(serialised).not.toContain('ownerTokenHash');
    });
});
