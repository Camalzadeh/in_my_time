import { POST as createPoll } from '@/app/api/polls/route';
import { POST as finalize } from '@/app/api/polls/[id]/finalize/route';
import { POST as castVote } from '@/app/api/polls/[id]/vote/route';
import { Poll } from '@/models/Poll';
import { ownerCookieName } from '@/lib/auth/tokens';

import { setUpTestDatabase, validConfig, FIRST_SLOT } from '../helpers/db';
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

    return { pollId, ownerToken: response.cookies.get(ownerCookieName(pollId))!.value };
}

const close = (pollId: string, body: unknown, cookies: Record<string, string> = {}) =>
    finalize(
        jsonRequest(`/api/polls/${pollId}/finalize`, 'POST', body, cookies),
        routeContext(pollId),
    );

describe('POST /api/polls/[id]/finalize', () => {
    // This is the hole the rewrite closed. There was no ownership check at all,
    // and `ownerId` was published in the poll's JSON, so anyone with the link
    // could close anyone's poll.
    it('refuses to close the poll without the owner cookie', async () => {
        const { pollId } = await makePoll();

        const response = await close(pollId, { finalSlot: FIRST_SLOT });

        expect(response.status).toBe(403);
        expect((await Poll.findById(pollId).lean())!.status).toBe('open');
    });

    it('refuses a forged owner cookie', async () => {
        const { pollId } = await makePoll();

        const response = await close(
            pollId,
            { finalSlot: FIRST_SLOT },
            { [ownerCookieName(pollId)]: 'f'.repeat(32) },
        );

        expect(response.status).toBe(403);
    });

    it('closes the poll for the owner', async () => {
        const { pollId, ownerToken } = await makePoll();

        const response = await close(
            pollId,
            { finalSlot: FIRST_SLOT },
            { [ownerCookieName(pollId)]: ownerToken },
        );

        expect(response.status).toBe(200);

        const poll = await Poll.findById(pollId).lean();
        expect(poll!.status).toBe('finalized');
        expect(poll!.finalTime!.toISOString()).toBe(FIRST_SLOT);
    });

    it('rejects a second close with 409', async () => {
        const { pollId, ownerToken } = await makePoll();
        const cookies = { [ownerCookieName(pollId)]: ownerToken };

        await close(pollId, { finalSlot: FIRST_SLOT }, cookies);
        const second = await close(pollId, { finalSlot: FIRST_SLOT }, cookies);

        expect(second.status).toBe(409);
    });

    it('rejects a slot that is not part of the poll', async () => {
        const { pollId, ownerToken } = await makePoll();

        const response = await close(
            pollId,
            { finalSlot: '2027-03-10T03:33:00.000Z' },
            { [ownerCookieName(pollId)]: ownerToken },
        );

        expect(response.status).toBe(400);
    });

    it('rejects a missing final slot with 400', async () => {
        const { pollId, ownerToken } = await makePoll();

        const response = await close(pollId, {}, { [ownerCookieName(pollId)]: ownerToken });

        expect(response.status).toBe(400);
    });

    it('stops further voting once closed', async () => {
        const { pollId, ownerToken } = await makePoll();

        await close(pollId, { finalSlot: FIRST_SLOT }, { [ownerCookieName(pollId)]: ownerToken });

        const response = await castVote(
            jsonRequest(`/api/polls/${pollId}/vote`, 'POST', {
                voterId: 'alice',
                voterName: 'Alice',
                selectedSlots: [FIRST_SLOT],
            }),
            routeContext(pollId),
        );

        expect(response.status).toBe(409);
    });
});
