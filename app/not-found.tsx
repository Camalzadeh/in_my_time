import Link from 'next/link';
import { ArrowLeft, SearchX } from 'lucide-react';

import SiteHeader from '@/app/components/SiteHeader';
import { UI_PATHS } from '@/lib/routes';

// Replaces Next's unstyled default, which rendered a bare black-on-white 404
// with none of the site's type or colours.
//
// The header is here for the same reason: a mistyped poll link used to be a
// dead end with one link back to the landing page, when what the visitor most
// likely wants is the search box to try the id again.
export default function NotFound() {
    return (
        <>
        <SiteHeader />
        <main
            id="main"
            className="flex min-h-[80vh] flex-col items-center justify-center bg-background px-4 text-center"
        >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <SearchX className="h-7 w-7 text-muted-foreground" aria-hidden />
            </div>

            <h1 className="text-2xl font-bold text-foreground">Nothing here</h1>
            <p className="mt-2 max-w-sm text-muted-foreground">
                This poll does not exist, or the link is incomplete. Poll links look like{' '}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">/polls/&lt;id&gt;</code>.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                    href={UI_PATHS.CREATE_POLL}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                    Create a poll
                </Link>

                <Link
                    href="/"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border px-6 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <ArrowLeft className="h-4 w-4" aria-hidden />
                    Back to the start
                </Link>
            </div>
        </main>
        </>
    );
}
