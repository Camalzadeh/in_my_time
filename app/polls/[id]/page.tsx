import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import PollView from '@/app/components/poll/PollView';
import { getPollPageData } from '@/lib/data/server/get-poll-data';

interface Props {
    params: Promise<{ id: string }>;
}

/**
 * Poll links get pasted into group chats, so the preview card matters. Nothing
 * generated one before and every shared link unfurled as a blank box.
 *
 * The missing-poll case is decided here rather than in the component below:
 * once metadata has resolved the response has begun, and a `notFound()` after
 * that point renders the right page but leaves the status at 200.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const data = await getPollPageData(id);

    if (!data) notFound();

    const { poll } = data;
    const days = poll.config.targetDates.length;

    const description =
        poll.description ||
        `Pick the times you are free. ${days} ${days === 1 ? 'day' : 'days'}, ` +
            `${poll.config.dailyStartTime}–${poll.config.dailyEndTime} ${poll.config.timezone}.`;

    return {
        title: poll.title,
        description,
        openGraph: { title: poll.title, description, type: 'website' },
        twitter: { card: 'summary', title: poll.title, description },
        // A poll's contents change with every vote; nothing here should be indexed.
        robots: { index: false, follow: false },
    };
}

export default async function PollPage({ params }: Props) {
    const { id } = await params;

    // Deduplicated with the call in generateMetadata, so this is not a second query.
    const data = await getPollPageData(id);

    if (!data) notFound();

    return <PollView pollId={id} data={data} />;
}
