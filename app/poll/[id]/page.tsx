import { PollContent } from '../../components/poll/PollContent'; // <-- { } Fiqurlu mötərizələr vacibdir!
import { notFound } from 'next/navigation'; // 404 səhifəsini göstərmək üçün

async function getPollData(pollId: string) {
    const res = await fetch(`http://localhost:3000/api/poll/${pollId}`, {
        cache: 'no-store',
    });

    if (res.status === 404) {
        notFound();
    }

    if (!res.ok) {
        throw new Error('Anket məlumatları gətirilərkən xəta baş verdi.');
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
        console.error("API-dən məlumat gətirmə xətası:", error);
        return <div className="text-center p-20 text-red-500">Məlumat gətirilərkən sunucu xətası baş verdi.</div>;
    }

    return (
        <PollContent pollData={pollData} pollId={pollId} />
    );
}