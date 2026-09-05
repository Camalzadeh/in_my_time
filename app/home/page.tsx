import type { Metadata } from 'next';

import SiteHeader from '@/app/components/SiteHeader';
import Footer from '@/app/components/home/Footer';
import LandingPageWrapper from '@/app/components/home/LandingPageWrapper';
import MyPollsView from '@/app/components/home/MyPollsView';
import { getMyPolls } from '@/lib/data/server/get-my-polls';

// /home is the visitor's own index of polls.
//
// It briefly redirected to / — it had been a second, identical copy of the
// landing page, and two URLs serving the same marketing copy is a duplicate
// worth removing. What it is now is not a copy: it is the one page that answers
// "what have I got open?", which without accounts had no answer at all.
//
// A visitor with nothing yet still sees the landing content here rather than a
// bare empty state, because a link to /home only appears once there is
// something behind it — arriving with nothing means the link was guessed, or
// the browser data was cleared. `noindex` keeps that fallback out of search,
// which is what the redirect was protecting.

export const metadata: Metadata = {
    title: 'Your polls',
    description: 'The polls this device has created or voted in.',
    robots: { index: false, follow: true },
};

export default async function MyPollsPage() {
    const { created, voted } = await getMyPolls();

    if (created.length === 0 && voted.length === 0) {
        return <LandingPageWrapper />;
    }

    return (
        <>
            <SiteHeader />
            <main id="main" className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-10">
                <div className="mx-auto max-w-5xl">
                    <MyPollsView created={created} voted={voted} />
                </div>
            </main>
            <Footer />
        </>
    );
}
