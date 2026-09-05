'use client';

import Link from 'next/link';
import { ArrowRight, LayoutGrid } from 'lucide-react';

import { UI_PATHS } from '@/lib/routes';
import { useHasPolls } from '@/lib/hooks/use-has-polls';

// A way back to your own polls from the front page.
//
// The header link alone was not enough: on the landing page the eye goes to the
// buttons under the headline, and someone returning to the site wants the poll
// they already made far more than the marketing copy. It renders nothing for a
// first-time visitor, who would only be sent to an empty page.

export default function MyPollsLink({ variant = 'hero' }: { variant?: 'hero' | 'cta' }) {
    const hasPolls = useHasPolls();

    if (!hasPolls) return null;

    if (variant === 'cta') {
        return (
            <Link
                href={UI_PATHS.HOME}
                className="mt-5 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                <LayoutGrid className="h-4 w-4" aria-hidden />
                Or open the polls you already have
                <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
        );
    }

    return (
        <Link
            href={UI_PATHS.HOME}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-card px-7 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
            <LayoutGrid className="h-4 w-4" aria-hidden />
            Your polls
        </Link>
    );
}
