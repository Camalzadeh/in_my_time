import { API_ROUTES } from "@/lib/routes";

export async function getPollStatusClient(pollId: string): Promise<number> {
    const path = API_ROUTES.POLL_DETAIL(pollId);

    try {
        const res = await fetch(path, {
            method: 'HEAD',
            cache: 'no-store',
        });

        return res.status;

    } catch (e) {
        console.error(`Error fetching status for poll ${pollId}:`, e);
        return 0;
    }
}