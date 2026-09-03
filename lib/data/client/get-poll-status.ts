import { API_ROUTES } from '@/lib/routes';

/**
 * Whether a poll exists, without downloading it.
 *
 * Returns the HTTP status, or 0 when the request could not be made at all —
 * the caller distinguishes "no such poll" from "no network".
 */
export async function getPollStatusClient(pollId: string): Promise<number> {
    try {
        const response = await fetch(API_ROUTES.POLL_DETAIL_API(pollId), {
            method: 'HEAD',
            cache: 'no-store',
        });

        return response.status;
    } catch {
        return 0;
    }
}
