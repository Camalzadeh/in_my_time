import { PollContent } from '../../components/poll/PollContent';
import { notFound } from 'next/navigation';
import {headers} from "next/headers";

async function getBaseUrl() {
    const headersList = await headers();

    const host = headersList.get('host');

    if (!host) {
        return 'http://localhost:3000';
    }

    const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';

    return `${protocol}://${host}`;
}

async function getPollData(pollId: string) {
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


interface PollPageProps {
    params: {
        id: string;
    };
}

export default async function PollPage({ params }: PollPageProps) {
    let parameters =  await params;
    const pollId = parameters.id;

    let pollData;
    try {
        pollData = await getPollData(pollId);
    } catch (error) {
        console.error("Error fetching data from API:", error);
        return <div className="text-center p-20 text-red-500">Server error occurred while fetching data.</div>;
    }

    return (
        <PollContent pollData={pollData} pollId={pollId} />
    );
}