import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

import { UI_PATHS } from '@/lib/routes';

// The preview on the right is illustrative, not live data. It mirrors the shape
// of the real grid so the page is not promising something different from what
// the product does.
const PREVIEW = [
    { label: 'Mon 14:00', votes: 5 },
    { label: 'Tue 10:00', votes: 4 },
    { label: 'Wed 15:00', votes: 3 },
    { label: 'Thu 13:00', votes: 1 },
] as const;

const MAX_PREVIEW_VOTES = 5;

export default function HeroSection() {
    return (
        <section className="py-14 md:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid items-center gap-12 md:grid-cols-2">
                    <div>
                        <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground text-balance sm:text-5xl">
                            Find a time that works for{' '}
                            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                everyone
                            </span>
                        </h1>

                        <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
                            Stop the back-and-forth. Propose some days, share one link, and watch the
                            answer appear as people mark what suits them.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href={UI_PATHS.CREATE_POLL}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            >
                                Create a poll
                                <ArrowRight className="h-4 w-4" aria-hidden />
                            </Link>

                            <a
                                href="#how-it-works"
                                className="inline-flex h-12 items-center justify-center rounded-full border border-border px-7 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                See how it works
                            </a>
                        </div>

                        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                            {['No sign-up', 'Works across time zones', 'Free'].map((point) => (
                                <li key={point} className="flex items-center gap-1.5">
                                    <Check className="h-4 w-4 text-primary" aria-hidden />
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Decorative: the real thing is one click away, and a screen
                        reader announcing fake vote counts would be misleading. */}
                    <div className="hidden md:block" aria-hidden>
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-foreground">Team sync</span>
                                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                    5 voted
                                </span>
                            </div>

                            <div className="mt-5 space-y-3">
                                {PREVIEW.map((slot) => (
                                    <div key={slot.label} className="flex items-center gap-3">
                                        <span className="w-20 shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                                            {slot.label}
                                        </span>
                                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                                                style={{
                                                    width: `${(slot.votes / MAX_PREVIEW_VOTES) * 100}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="w-4 shrink-0 text-right text-xs font-semibold tabular-nums text-foreground">
                                            {slot.votes}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
