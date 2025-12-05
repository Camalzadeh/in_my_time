import {headers} from "next/headers";
import {notFound} from "next/navigation";
import {API_ROUTES} from "@/lib/routes";

export async function getBaseUrl() {
    const headersList = await headers();
    const host = headersList.get('host');

    if (host && (host.includes('localhost') || host.includes('127.0.0.1'))) {
        return `http://${host}`;
    }
    if (host) {
        return `https://${host}`;
    }
    return '';
}

export async function getPollData(pollId: string) {

    const path = API_ROUTES.POLL_DETAIL(pollId);

    const res = await fetch(path, {
        cache: 'no-store',
    });

    if (res.status === 404) {
        notFound();
    }

    if (!res.ok) {
        const errorDetail = await res.text();
        throw new Error(`Failed to fetch poll data. Status: ${res.status}. Details: ${errorDetail}`);
    }

    return res.json();
}