import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { UI_PATHS } from '@/lib/routes';

export default function CtaSection() {
    return (
        <section className="border-t border-border py-14 md:py-20">
            <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold tracking-tight text-foreground text-balance md:text-4xl">
                    Ready to stop asking &ldquo;when are you free?&rdquo;
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
                    Make a poll, send the link, get an answer.
                </p>

                <Link
                    href={UI_PATHS.CREATE_POLL}
                    className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                    Create a poll
                    <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
            </div>
        </section>
    );
}
