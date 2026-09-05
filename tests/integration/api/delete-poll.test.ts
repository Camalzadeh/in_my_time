import { POST as createPoll } from '@/app/api/polls/route';
import { DELETE as deletePoll } from '@/app/api/polls/[id]/route';
import { POST as forgetPoll } from '@/app/api/polls/[id]/forget/route';
import { POST as castVote } from '@/app/api/polls/[id]/vote/route';
import { Poll } from '@/models/Poll';
import { ownerCookieName, voterCookieName, createToken } from '@/lib/auth/tokens';

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

const remove = (pollId: string, cookies: Record<string, string> = {}) =>
    deletePoll(
        jsonRequest(`/api/polls/${pollId}`, 'DELETE', null, cookies),
        routeContext(pollId),
    );

describe('DELETE /api/polls/[id]', () => {
    it('deletes the poll for whoever holds the owner token', async () => {
        const { pollId, ownerToken } = await makePoll();

        const response = await remove(pollId, { [ownerCookieName(pollId)]: ownerToken });

        expect(response.status).toBe(200);
        expect(await Poll.findById(pollId)).toBeNull();
    });

    // A poll id travels in every shared link, so holding one must not be enough.
    it('refuses without the owner cookie', async () => {
        const { pollId } = await makePoll();

        const response = await remove(pollId);

        expect(response.status).toBe(403);
        expect(await Poll.findById(pollId)).not.toBeNull();
    });

    it('refuses a wrong owner token', async () => {
        const { pollId } = await makePoll();

        const response = await remove(pollId, { [ownerCookieName(pollId)]: createToken() });

        expect(response.status).toBe(403);
        expect(await Poll.findById(pollId)).not.toBeNull();
    });

    // Voting gives a token for the same poll, and it must not be mistaken for
    // permission to destroy it.
    it('refuses a participant holding only a voter token', async () => {
        const { pollId } = await makePoll();

        const voted = await castVote(
            jsonRequest(`/api/polls/${pollId}/vote`, 'POST', {
                voterId: 'someone-else',
                voterName: 'Rauf',
                selectedSlots: [FIRST_SLOT],
            }),
            routeContext(pollId),
        );

        const voterToken = voted.cookies.get(voterCookieName(pollId))!.value;

        const response = await remove(pollId, { [voterCookieName(pollId)]: voterToken });

        expect(response.status).toBe(403);
        expect(await Poll.findById(pollId)).not.toBeNull();
    });

    it('clears the tokens so the poll stops being listed', async () => {
        const { pollId, ownerToken } = await makePoll();

        const response = await remove(pollId, { [ownerCookieName(pollId)]: ownerToken });

        expect(response.cookies.get(ownerCookieName(pollId))?.value).toBe('');
        expect(response.cookies.get(voterCookieName(pollId))?.value).toBe('');
    });

    it('answers 404 for a poll that is already gone', async () => {
        const { pollId, ownerToken } = await makePoll();
        await Poll.deleteMany({});

        const response = await remove(pollId, { [ownerCookieName(pollId)]: ownerToken });

        expect(response.status).toBe(404);
    });

    it('rejects an id that is not an object id', async () => {
        expect((await remove('nonsense')).status).toBe(400);
    });
});

describe('POST /api/polls/[id]/forget', () => {
    it('drops the cookies and leaves the poll alone', async () => {
        const { pollId, ownerToken } = await makePoll();

        const response = await forgetPoll(
            jsonRequest(`/api/polls/${pollId}/forget`, 'POST', null, {
                [ownerCookieName(pollId)]: ownerToken,
            }),
            routeContext(pollId),
        );

        expect(response.status).toBe(200);
        expect(response.cookies.get(ownerCookieName(pollId))?.value).toBe('');

        // The whole point: forgetting is not deleting.
        expect(await Poll.findById(pollId)).not.toBeNull();
    });

    it('rejects an id that is not an object id', async () => {
        const response = await forgetPoll(
            jsonRequest('/api/polls/nonsense/forget', 'POST', null),
            routeContext('nonsense'),
        );

        expect(response.status).toBe(400);
    });
});
