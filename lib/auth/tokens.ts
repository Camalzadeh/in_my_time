// Importing this from a client component is a build error, not a runtime one.
// A constant used to be exported from models/Poll.ts, a form imported it, and
// mongoose came along for the ride — the page server-rendered fine and then
// threw `Cannot read properties of undefined (reading 'Poll')` on hydration.
import 'server-only';

import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import type { NextResponse } from 'next/server';

// Ownership without accounts.
//
// The old setup identified the owner by `ownerId` — a UUID the browser kept in
// localStorage. The problem was that the same UUID came back in the poll's
// public JSON. Anyone holding the link could read it and POST it to the
// finalize endpoint, which closed *someone else's* poll.
//
// Now the server mints a random token, stores only its SHA-256 in the poll, and
// hands the raw token to the browser in an httpOnly cookie. Script on the page
// cannot read it, the hash cannot be reversed, and no response carries a secret.
//
// There is deliberately no signing key (APP_SECRET or similar): the stored hash
// is the source of truth, so this needs no new environment variable.

const TOKEN_BYTES = 16; // 128 bits
const MAX_AGE_SECONDS = 60 * 60 * 24 * 180; // 180 days

export function createToken(): string {
    return randomBytes(TOKEN_BYTES).toString('hex');
}

export function hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}

/** Constant-time comparison, tolerant of a missing token or hash. */
export function tokenMatchesHash(token: string | undefined, expectedHash: string | undefined): boolean {
    if (!token || !expectedHash) return false;

    const actual = Buffer.from(hashToken(token), 'hex');
    const expected = Buffer.from(expectedHash, 'hex');

    if (actual.length !== expected.length) return false;

    return timingSafeEqual(actual, expected);
}

export const ownerCookieName = (pollId: string) => `imt_o_${pollId}`;
export const voterCookieName = (pollId: string) => `imt_v_${pollId}`;

/**
 * Sets the cookie on the response.
 *
 * Writing through the response rather than `cookies()` keeps the behaviour the
 * same no matter how the response was built.
 */
export function attachToken(response: NextResponse, name: string, token: string): void {
    response.cookies.set(name, token, {
        httpOnly: true,
        sameSite: 'lax', // poll links get shared and opened directly
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: MAX_AGE_SECONDS,
    });
}
