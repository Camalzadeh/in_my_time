import { PollContent } from '../../components/poll/PollContent';
import { notFound } from 'next/navigation';

async function getPollData(pollId: string) {
    const res = await fetch(`http://localhost:3000/api/poll/${pollId}`, {
        cache: 'no-store',
    });

    if (res.status === 404) {
        notFound();
    }

    if (!res.ok) {
        throw new Error('Failed to fetch poll data.');
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