import {headers} from "next/headers";
import {notFound} from "next/navigation";

export async function getBaseUrl() {
    const headersList = await headers();

    const host = headersList.get('host');

    if (!host) {
        return 'http://localhost:3000';
    }

    const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';

    return `${protocol}://${host}`;
}

export async function getPollData(pollId: string) {
    const BASE_URL = await getBaseUrl();

    const res = await fetch(`${BASE_URL}/api/poll/${pollId}`, {
        cache: 'no-store',
    });

    if (res.status === 404) {
        notFound();
    }

    if (!res.ok) {
        throw new Error(`Failed to fetch poll data from ${BASE_URL}. Status: ${res.status}`);
    }

    return res.json();
}
