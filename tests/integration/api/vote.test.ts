import { POST as createPoll } from '@/app/api/polls/route';
import { POST as castVote, DELETE as clearVote } from '@/app/api/polls/[id]/vote/route';
import { Poll } from '@/models/Poll';
import { ownerCookieName, voterCookieName } from '@/lib/auth/tokens';

import { setUpTestDatabase, validConfig, FIRST_SLOT, SECOND_SLOT } from '../helpers/db';
import { jsonRequest, routeContext } from '../helpers/request';

setUpTestDatabase();

async function makePoll() {
    const response = await createPoll(
        new Request('http://localhost/api/polls', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ title: 'Test poll', config: validConfig }),
        }),
    );

    const { pollId } = await response.json();

    return {
        pollId,
        ownerToken: response.cookies.get(ownerCookieName(pollId))!.value,
    };
}

async function vote(
    pollId: string,
    body: { voterId: string; voterName: string; selectedSlots: string[] },
    cookies: Record<string, string> = {},
) {
    return castVote(
        jsonRequest(`/api/polls/${pollId}/vote`, 'POST', body, cookies),
        routeContext(pollId),
    );
}

describe('POST /api/polls/[id]/vote', () => {
    it('records a vote and hands back a token', async () => {
        const { pollId } = await makePoll();

        const response = await vote(pollId, {
            voterId: 'alice',
            voterName: 'Alice',
            selectedSlots: [FIRST_SLOT],
        });

        expect(response.status).toBe(200);
        expect(response.cookies.get(voterCookieName(pollId))?.value).toEqual(expect.any(String));

        const poll = await Poll.findById(pollId).lean();
        expect(poll!.votes).toHaveLength(1);
        expect(poll!.votes[0].voterName).toBe('Alice');
        expect(poll!.votes[0].selectedSlots[0].toISOString()).toBe(FIRST_SLOT);
    });

    it('never returns the token hash', async () => {
        const { pollId } = await makePoll();

        const response = await vote(pollId, {
            voterId: 'alice',
            voterName: 'Alice',
            selectedSlots: [FIRST_SLOT],
        });

        expect(JSON.stringify(await response.json())).not.toContain('tokenHash');
    });

    it('updates an existing vote rather than adding a second one', async () => {
        const { pollId } = await makePoll();

        const first = await vote(pollId, {
            voterId: 'alice',
            voterName: 'Alice',
            selectedSlots: [FIRST_SLOT],
        });
        const token = first.cookies.get(voterCookieName(pollId))!.value;

        await vote(
            pollId,
            { voterId: 'alice', voterName: 'Alice', selectedSlots: [SECOND_SLOT] },
            { [voterCookieName(pollId)]: token },
        );

        const poll = await Poll.findById(pollId).lean();
        expect(poll!.votes).toHaveLength(1);
        expect(poll!.votes[0].selectedSlots[0].toISOString()).toBe(SECOND_SLOT);
    });

    // The old implementation looked for the vote and then pushed if it found
    // none, with a gap in between. Two requests landing together produced two
    // entries for one person.
    it('does not duplicate a vote when two requests arrive at once', async () => {
        const { pollId } = await makePoll();

        await Promise.all([
            vote(pollId, { voterId: 'alice', voterName: 'Alice', selectedSlots: [FIRST_SLOT] }),
            vote(pollId, { voterId: 'alice', voterName: 'Alice', selectedSlots: [SECOND_SLOT] }),
        ]);

        const poll = await Poll.findById(pollId).lean();
        expect(poll!.votes).toHaveLength(1);
    });

    it('refuses to change someone else’s vote', async () => {
        const { pollId } = await makePoll();

        await vote(pollId, { voterId: 'alice', voterName: 'Alice', selectedSlots: [FIRST_SLOT] });

        const response = await vote(pollId, {
            voterId: 'alice',
            voterName: 'Mallory',
            selectedSlots: [],
        });

        expect(response.status).toBe(403);

        const poll = await Poll.findById(pollId).lean();
        expect(poll!.votes[0].voterName).toBe('Alice');
    });

    it('lets the owner edit a vote without stealing its token', async () => {
        const { pollId, ownerToken } = await makePoll();

        const first = await vote(pollId, {
            voterId: 'alice',
            voterName: 'Alice',
            selectedSlots: [FIRST_SLOT],
        });
        const aliceToken = first.cookies.get(voterCookieName(pollId))!.value;

        const asOwner = await vote(
            pollId,
            { voterId: 'alice', voterName: 'Alice', selectedSlots: [SECOND_SLOT] },
            { [ownerCookieName(pollId)]: ownerToken },
        );
        expect(asOwner.status).toBe(200);

        // Alice's own token must still work afterwards.
        const asAlice = await vote(
            pollId,
            { voterId: 'alice', voterName: 'Alice', selectedSlots: [FIRST_SLOT] },
            { [voterCookieName(pollId)]: aliceToken },
        );
        expect(asAlice.status).toBe(200);
    });

    it('rejects a slot that is not part of the poll', async () => {
        const { pollId } = await makePoll();

        const response = await vote(pollId, {
            voterId: 'alice',
            voterName: 'Alice',
            selectedSlots: ['2027-03-10T03:33:00.000Z'],
        });

        expect(response.status).toBe(400);
    });

    it('rejects an incomplete body with 400', async () => {
        const { pollId } = await makePoll();

        const response = await castVote(
            jsonRequest(`/api/polls/${pollId}/vote`, 'POST', { voterId: '', voterName: '' }),
            routeContext(pollId),
        );

        expect(response.status).toBe(400);
    });

    it('rejects a malformed poll id with 400', async () => {
        const response = await castVote(
            jsonRequest('/api/polls/not-an-id/vote', 'POST', {
                voterId: 'a',
                voterName: 'A',
                selectedSlots: [],
            }),
            routeContext('not-an-id'),
        );

        expect(response.status).toBe(400);
    });
});

describe('DELETE /api/polls/[id]/vote', () => {
    it('clears your own vote', async () => {
        const { pollId } = await makePoll();

        const cast = await vote(pollId, {
            voterId: 'alice',
            voterName: 'Alice',
            selectedSlots: [FIRST_SLOT],
        });
        const token = cast.cookies.get(voterCookieName(pollId))!.value;

        const response = await clearVote(
            jsonRequest(
                `/api/polls/${pollId}/vote`,
                'DELETE',
                { voterId: 'alice' },
                { [voterCookieName(pollId)]: token },
            ),
            routeContext(pollId),
        );

        expect(response.status).toBe(200);
        expect((await Poll.findById(pollId).lean())!.votes).toHaveLength(0);
    });

    it('refuses to clear a stranger’s vote', async () => {
        const { pollId } = await makePoll();

        await vote(pollId, { voterId: 'alice', voterName: 'Alice', selectedSlots: [FIRST_SLOT] });

        const response = await clearVote(
            jsonRequest(`/api/polls/${pollId}/vote`, 'DELETE', { voterId: 'alice' }),
            routeContext(pollId),
        );

        expect(response.status).toBe(403);
        expect((await Poll.findById(pollId).lean())!.votes).toHaveLength(1);
    });

    it('lets the owner clear anyone’s vote', async () => {
        const { pollId, ownerToken } = await makePoll();

        await vote(pollId, { voterId: 'alice', voterName: 'Alice', selectedSlots: [FIRST_SLOT] });

        const response = await clearVote(
            jsonRequest(
                `/api/polls/${pollId}/vote`,
                'DELETE',
                { voterId: 'alice' },
                { [ownerCookieName(pollId)]: ownerToken },
            ),
            routeContext(pollId),
        );

        expect(response.status).toBe(200);
    });
});
