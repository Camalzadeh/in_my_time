import Link from 'next/link';
import { ArrowLeft, SearchX } from 'lucide-react';

// Replaces Next's unstyled default, which rendered a bare black-on-white 404
// with none of the site's type or colours.
export default function NotFound() {
    return (
        <main
            id="main"
            className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center"
        >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <SearchX className="h-7 w-7 text-muted-foreground" aria-hidden />
            </div>

            <h1 className="text-2xl font-bold text-foreground">Nothing here</h1>
            <p className="mt-2 max-w-sm text-muted-foreground">
                This poll does not exist, or the link is incomplete. Poll links look like{' '}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">/polls/&lt;id&gt;</code>.
            </p>

            <Link
                href="/"
                className="mt-7 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Back to the start
            </Link>
        </main>
    );
}
