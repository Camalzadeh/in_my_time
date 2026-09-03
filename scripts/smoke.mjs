// End-to-end smoke test against a running server.
//
//   node scripts/smoke.mjs [baseUrl]
//
// Covers the things unit tests cannot: that ownership and vote tokens are
// actually enforced over HTTP, that secrets stay out of responses, and that
// slots are stored as the instants the poll's time zone implies.

const BASE = process.argv[2] ?? 'http://localhost:3000';

let failures = 0;

function check(name, actual, expected) {
    const ok = actual === expected;
    if (!ok) failures++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `  (got ${actual}, want ${expected})`}`);
}

/** A tiny cookie jar, so each identity is a separate "browser". */
function jar() {
    const cookies = new Map();
    return {
        header: () => [...cookies].map(([k, v]) => `${k}=${v}`).join('; '),
        absorb: (response) => {
            for (const raw of response.headers.getSetCookie?.() ?? []) {
                const [pair] = raw.split(';');
                const index = pair.indexOf('=');
                cookies.set(pair.slice(0, index), pair.slice(index + 1));
            }
        },
        size: () => cookies.size,
    };
}

async function call(who, method, path, body) {
    const response = await fetch(`${BASE}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json', cookie: who.header() },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    who.absorb(response);

    const text = await response.text();
    let json = null;
    try { json = JSON.parse(text); } catch { /* HTML error page */ }

    return { status: response.status, json, text };
}

const owner = jar();
const alice = jar();
const mallory = jar();

const config = {
    targetDates: ['2027-03-10', '2027-03-11'],
    dailyStartTime: '09:00',
    dailyEndTime: '12:00',
    slotDuration: 60,
    timezone: 'Asia/Baku',
};

// 09:00 in Baku (UTC+4) is 05:00 UTC.
const SLOT = '2027-03-10T05:00:00.000Z';

const created = await call(owner, 'POST', '/api/polls', { title: 'Smoke test', config });
check('create poll', created.status, 201);
check('owner receives a cookie', owner.size(), 1);

const id = created.json?.pollId;
if (!id) { console.log('no poll id, stopping'); process.exit(1); }

const read = await call(alice, 'GET', `/api/polls/${id}`);
check('read poll', read.status, 200);
check('ownerTokenHash is not exposed', read.text.includes('ownerTokenHash'), false);
check('ownerId is gone entirely', read.text.includes('ownerId'), false);
check('timezone is stored', read.json?.config?.timezone, 'Asia/Baku');

check('bad calendar date is 400, not 500',
    (await call(owner, 'POST', '/api/polls', { title: 'x', config: { ...config, targetDates: ['2027-02-31'] } })).status, 400);
check('end before start is 400',
    (await call(owner, 'POST', '/api/polls', { title: 'x', config: { ...config, dailyEndTime: '08:00' } })).status, 400);

const vote = await call(alice, 'POST', `/api/polls/${id}/vote`, {
    voterId: 'alice', voterName: 'Alice', selectedSlots: [SLOT],
});
check('alice votes', vote.status, 200);
check('alice receives a vote cookie', alice.size(), 1);
check('vote response carries no tokenHash', vote.text.includes('tokenHash'), false);

check('slot outside the poll is rejected',
    (await call(alice, 'POST', `/api/polls/${id}/vote`, {
        voterId: 'alice', voterName: 'Alice', selectedSlots: ['2027-03-10T03:33:00.000Z'],
    })).status, 400);

check('stranger cannot overwrite a vote',
    (await call(mallory, 'POST', `/api/polls/${id}/vote`, {
        voterId: 'alice', voterName: 'Mallory', selectedSlots: [],
    })).status, 403);

check('stranger cannot clear a vote',
    (await call(mallory, 'DELETE', `/api/polls/${id}/vote`, { voterId: 'alice' })).status, 403);

check('stranger cannot close the poll',
    (await call(mallory, 'POST', `/api/polls/${id}/finalize`, { finalSlot: SLOT })).status, 403);

check('owner closes the poll',
    (await call(owner, 'POST', `/api/polls/${id}/finalize`, { finalSlot: SLOT })).status, 200);

check('closing twice is rejected',
    (await call(owner, 'POST', `/api/polls/${id}/finalize`, { finalSlot: SLOT })).status, 409);

check('voting after close is rejected',
    (await call(alice, 'POST', `/api/polls/${id}/vote`, {
        voterId: 'alice', voterName: 'Alice', selectedSlots: [SLOT],
    })).status, 409);

console.log(failures === 0 ? '\nall checks passed' : `\n${failures} check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
