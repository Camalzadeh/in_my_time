// Importing this from a client component is a build error, not a runtime one.
// A constant used to be exported from models/Poll.ts, a form imported it, and
// mongoose came along for the ride — the page server-rendered fine and then
// threw `Cannot read properties of undefined (reading 'Poll')` on hydration.
import 'server-only';

import Ably from 'ably';
import { pollChannelName, POLL_EVENT, type PollEvent } from '@/lib/poll-state';

// Realtime publishing.
//
// This used to be an Atlas App Services trigger: the write hit the database, a
// change stream fired, and a function outside this repository published to
// Ably. That had three problems. The Ably key was hard-coded into the function
// source. The function crashed on deletes, because `fullDocument` is absent
// there. And every message carried the *entire* poll document, so it grew with
// the vote count. On top of that the code was invisible here — not versioned,
// not tested, and impossible to run locally.
//
// Every write already goes through our own route handlers, so they publish
// directly. Ably itself is unchanged; only the sender moved.
//
// The key is `ABLY_API_KEY`, which already exists in the deployment because
// `/api/ably` reads it. Nothing new to provision.

export type { PollEvent };

let cached: Ably.Rest | null = null;

function restClient(): Ably.Rest | null {
    const key = process.env.ABLY_API_KEY;
    if (!key) return null;

    if (!cached) cached = new Ably.Rest(key);
    return cached;
}

/** Whether realtime is configured. The UI reads this so it can be honest. */
export function isRealtimeConfigured(): boolean {
    return Boolean(process.env.ABLY_API_KEY);
}

/**
 * Publishes one change.
 *
 * **Never throws.** The vote is already committed; a failed publish means other
 * participants see it on their next page load rather than instantly. Failing
 * the request over that would cost the user more than it saves.
 *
 * With no key configured it returns quietly — the site works without Ably.
 */
export async function publishPollEvent(pollId: string, event: PollEvent): Promise<void> {
    const client = restClient();
    if (!client) return;

    try {
        await client.channels.get(pollChannelName(pollId)).publish(POLL_EVENT, event);
    } catch (error) {
        console.error('[realtime] publish failed', { pollId, type: event.type, error });
    }
}
