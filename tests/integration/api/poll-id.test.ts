import { POST as createPoll } from '@/app/api/polls/route';
import { GET as readPoll } from '@/app/api/polls/[id]/route';
import { POST as castVote } from '@/app/api/polls/[id]/vote/route';

import { setUpTestDatabase, validConfig, FIRST_SLOT } from '../helpers/db';
import { jsonRequest, routeContext } from '../helpers/request';

setUpTestDatabase();

async function makePoll() {
    const response = await createPoll(
        new Request('http://localhost/api/polls', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ title: 'Test poll', description: 'notes', config: validConfig }),
        }),
    );

    const { pollId } = await response.json();
    return pollId as string;
}

const read = (id: string) =>
    readPoll(new Request(`http://localhost/api/polls/${id}`), routeContext(id));

describe('GET /api/polls/[id]', () => {
    it('returns the poll', async () => {
        const pollId = await makePoll();

        const response = await read(pollId);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.title).toBe('Test poll');
        expect(body.description).toBe('notes');
        expect(body.config.timezone).toBe('Asia/Baku');
        expect(body.status).toBe('open');
    });

    // `ownerId` used to be part of this response, which is how anyone with the
    // link could claim ownership.
    it('exposes no ownership secrets', async () => {
        const pollId = await makePoll();

        const raw = JSON.stringify(await (await read(pollId)).json());

        expect(raw).not.toContain('ownerTokenHash');
        expect(raw).not.toContain('ownerId');
    });

    it('exposes no per-vote token hashes', async () => {
        const pollId = await makePoll();

        await castVote(
            jsonRequest(`/api/polls/${pollId}/vote`, 'POST', {
                voterId: 'alice',
                voterName: 'Alice',
                selectedSlots: [FIRST_SLOT],
            }),
            routeContext(pollId),
        );

        const body = await (await read(pollId)).json();

        expect(body.votes).toHaveLength(1);
        expect(JSON.stringify(body)).not.toContain('tokenHash');
    });

    it('serialises slots as ISO strings', async () => {
        const pollId = await makePoll();

        await castVote(
            jsonRequest(`/api/polls/${pollId}/vote`, 'POST', {
                voterId: 'alice',
                voterName: 'Alice',
                selectedSlots: [FIRST_SLOT],
            }),
            routeContext(pollId),
        );

        const body = await (await read(pollId)).json();
        expect(body.votes[0].selectedSlots).toEqual([FIRST_SLOT]);
    });

    it('answers 404 for a poll that does not exist', async () => {
        expect((await read('6a9966d6934caab5b155eee1')).status).toBe(404);
    });

    it('answers 400 for a malformed id', async () => {
        expect((await read('not-an-id')).status).toBe(400);
    });
});
