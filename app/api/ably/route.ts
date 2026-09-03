import { NextResponse } from 'next/server';
import Ably from 'ably';

// The browser connects to Ably directly, so it must never see the API key.
// The server hands out a short-lived token request instead.

export const dynamic = 'force-dynamic';

export async function GET() {
    const key = process.env.ABLY_API_KEY;

    if (!key) {
        // This used to be a 500. It is a 503 now: nothing is broken, realtime
        // is simply not configured, and the client falls back quietly.
        return NextResponse.json({ error: 'realtime-disabled' }, { status: 503 });
    }

    try {
        const client = new Ably.Rest(key);

        // A distinct clientId per browser. It was a single hard-coded string
        // before, so Ably could not tell connections apart.
        const tokenRequest = await client.auth.createTokenRequest({
            clientId: `viewer-${crypto.randomUUID()}`,
        });

        return NextResponse.json(tokenRequest);
    } catch (error) {
        console.error('[ably] token request failed', error);
        return NextResponse.json({ error: 'token-failed' }, { status: 502 });
    }
}
