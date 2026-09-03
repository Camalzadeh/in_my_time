'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCw } from 'lucide-react';

// There was no error boundary at all, so an unhandled server error showed Next's
// generic page and the only way forward was the browser's back button.
export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[app] unhandled error', error);
    }, [error]);

    return (
        <main
            id="main"
            className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center"
        >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-7 w-7 text-destructive" aria-hidden />
            </div>

            <h1 className="text-2xl font-bold text-foreground">Something broke</h1>
            <p className="mt-2 max-w-sm text-muted-foreground">
                Nothing you did caused this. Trying again often works — the database may have been
                briefly unreachable.
            </p>

            {/* Vercel logs are keyed by this, so showing it makes a report useful. */}
            {error.digest && (
                <p className="mt-4 font-mono text-xs text-muted-foreground">
                    Reference: {error.digest}
                </p>
            )}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                    type="button"
                    onClick={reset}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                    <RotateCw className="h-4 w-4" aria-hidden />
                    Try again
                </button>

                <Link
                    href="/"
                    className="inline-flex h-11 items-center justify-center rounded-full border border-border px-6 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    Go home
                </Link>
            </div>
        </main>
    );
}
