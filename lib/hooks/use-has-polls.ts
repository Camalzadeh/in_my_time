'use client';

import { useEffect, useState } from 'react';

import { HAS_POLLS_COOKIE } from '@/lib/cookie-names';

/**
 * Whether this browser has created or voted in anything, so the header can
 * offer a link to /home.
 *
 * The real evidence — the per-poll tokens — is httpOnly and invisible here by
 * design. What is read instead is a plain marker cookie the server sets
 * alongside them. Getting this wrong shows or hides a link and nothing else:
 * /home builds its list from the tokens, so a forged marker leads to a page
 * that lists nothing.
 *
 * Starts false so the server's markup and the browser's first render agree.
 */
export function useHasPolls(): boolean {
    const [hasPolls, setHasPolls] = useState(false);

    useEffect(() => {
        try {
            setHasPolls(
                document.cookie
                    .split(';')
                    .some((entry) => entry.trim().startsWith(`${HAS_POLLS_COOKIE}=`)),
            );
        } catch {
            // Storage blocked entirely. The link stays hidden; /home still works.
        }
    }, []);

    return hasPolls;
}
