import {notFound} from "next/navigation";
import {API_ROUTES} from "@/lib/routes";
import { getBaseUrl } from "@/lib/data/get-base-url";


export async function getPollDataServer(pollId: string) {
    const baseUrl = await getBaseUrl();
    const apiPath = API_ROUTES.POLL_DETAIL(pollId);
    const fullUrl = `${baseUrl}${apiPath}`;

    const res = await fetch(fullUrl, {
        cache: 'no-store',
    });

    if (res.status === 404) {
        notFound();
    }

    if (!res.ok) {
        const errorDetail = await res.text();
        throw new Error(`Failed to fetch poll data from ${fullUrl}. Status: ${res.status}. Details: ${errorDetail}`);
    }

    return res.json();
}

