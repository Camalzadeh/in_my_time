import { NextResponse, type NextRequest } from 'next/server';

import {
    HAS_POLLS_COOKIE,
    HAS_POLLS_MAX_AGE,
    OWNER_COOKIE_PREFIX,
    VOTER_COOKIE_PREFIX,
} from '@/lib/cookie-names';

// Gives the marker cookie to browsers that predate it.
//
// The header offers "My polls" when `imt_seen` is present, and the routes that
// create a poll or save a vote set it. That covers everyone from now on and
// nobody from before: a browser holding poll tokens issued last week has no
// marker, so the link stayed hidden even though /home had polls to show. This
// was reported by the owner, whose own polls were invisible from the front page.
//
// Reading the tokens is all that happens here — no database, no verification.
// Getting it wrong shows a link, and /home still builds its list from the
// tokens themselves, so a browser with stale ones lands on an empty page rather
// than someone else's.

export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    if (request.cookies.has(HAS_POLLS_COOKIE)) return response;

    const holdsToken = request.cookies
        .getAll()
        .some(
            (cookie) =>
                cookie.name.startsWith(OWNER_COOKIE_PREFIX) ||
                cookie.name.startsWith(VOTER_COOKIE_PREFIX),
        );

    if (holdsToken) {
        response.cookies.set(HAS_POLLS_COOKIE, '1', {
            httpOnly: false,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: HAS_POLLS_MAX_AGE,
        });
    }

    return response;
}

export const config = {
    // Pages only. The API routes that matter set the marker themselves, and
    // running this for every static asset would be pure overhead.
    matcher: ['/((?!api|_next/static|_next/image|.*\..*).*)'],
};
