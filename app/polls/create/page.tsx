import type { Metadata } from 'next';

import CreatePollForm from '@/app/components/create/CreatePollForm';
import SiteHeader from '@/app/components/SiteHeader';

export const metadata: Metadata = {
    title: 'Create a poll',
    description: 'Pick the days and hours, share the link, and see when everyone is free.',
};

export default function CreatePollPage() {
    return (
        <>
            <SiteHeader />
            <main id="main" className="min-h-screen bg-background px-4 py-6 sm:py-8">
                <div className="mx-auto max-w-2xl space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Create a poll
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            Pick the days and hours you want to offer. Everyone else marks what suits
                            them — no accounts, no sign-up.
                        </p>
                    </div>

                    <CreatePollForm />
                </div>
            </main>
        </>
    );
}
