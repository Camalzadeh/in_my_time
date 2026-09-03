import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import CreatePollForm from '@/app/components/create/CreatePollForm';

import ThemeToggle from '@/app/components/ThemeToggle';

export const metadata: Metadata = {
    title: 'Create a poll',
    description: 'Pick the days and hours, share the link, and see when everyone is free.',
};

export default function CreatePollPage() {
    return (
        <main id="main" className="min-h-screen bg-background px-4 py-8">
            <div className="mx-auto max-w-2xl space-y-6">
                {/* These pages have no site header, so the theme control lives here. */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-lg px-2 py-1 -ml-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <ArrowLeft className="h-4 w-4" aria-hidden />
                        Home
                    </Link>

                    <ThemeToggle />
                </div>

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
    );
}
