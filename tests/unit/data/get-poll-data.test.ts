import {notFound} from "next/navigation";
import {API_ROUTES} from "@/lib/routes";
import getBaseUrl from "@/lib/data/get-base-url"; // getBaseUrl funksiyasını import edirik


export default async function dgetPollData(
    pollId: string,
    useBaseUrl: boolean = false // Default olaraq 'false' qoyulur
) {

    let urlToFetch: string;
    const apiPath = API_ROUTES.POLL_DETAIL(pollId); // Göreli yol: /api/polls/[id]

    if (useBaseUrl) {
        // useBaseUrl TRUE olduqda (Server Component konteksti): Tam URL yaradılır
        const baseUrl = await getBaseUrl();
        urlToFetch = `${baseUrl}${apiPath}`;
    } else {
        // useBaseUrl FALSE olduqda (Client Component konteksti): Göreli yol istifadə edilir
        urlToFetch = apiPath;
    }

    const res = await fetch(urlToFetch, {
        cache: 'no-store',
    });

    if (res.status === 404) {
        notFound();
    }

    if (!res.ok) {
        const errorDetail = await res.text();
        // Xəta mesajına istifadə olunan URL-i əlavə edirik
        throw new Error(`Failed to fetch poll data from ${urlToFetch}. Status: ${res.status}. Details: ${errorDetail}`);
    }

    return res.json();
}