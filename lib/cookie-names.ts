// Cookie names, shared by the server that sets them and the browser that looks
// for the one it is allowed to see.
//
// Nothing may be imported here. That is the point: lib/auth/tokens.ts is
// `server-only`, so a client component asking "does this browser have polls?"
// cannot reach the names through it without dragging node:crypto into the
// bundle.

export const OWNER_COOKIE_PREFIX = 'imt_o_';
export const VOTER_COOKIE_PREFIX = 'imt_v_';

/** Readable by page script, unlike the two above. Grants nothing. */
export const HAS_POLLS_COOKIE = 'imt_seen';
