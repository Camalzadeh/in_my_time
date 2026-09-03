'use client';

import { useEffect, useState } from 'react';
import { Globe, Info } from 'lucide-react';

import type { DayView } from '@/lib/hooks/use-poll-manager';
import { guessTimeZone } from '@/lib/time/zone';

interface Props {
    slotDuration: number;
    timezone: string;
    days: DayView[];
}

export default function PollSidebarStats({ slotDuration, timezone, days }: Props) {
    const best = days.reduce<{ label: string; count: number }>(
        (winner, day) => {
            const total = day.slots.reduce((sum, slot) => sum + slot.count, 0);
            return total > winner.count
                ? { label: `${day.weekday}, ${day.dayLabel}`, count: total }
                : winner;
        },
        { label: '—', count: 0 },
    );

    return (
        <div className="space-y-4">
            <section className="rounded-2xl border border-border bg-card p-5">
                <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Info className="h-4 w-4 text-muted-foreground" aria-hidden />
                    How this works
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    Pick <strong className="font-semibold text-foreground">every</strong> slot you
                    could make, not just your favourite. Each one is {slotDuration} minutes. The
                    darker a cell, the more people are free then.
                </p>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5">
                <dl className="space-y-3 text-sm">
                    <div className="flex items-baseline justify-between gap-3">
                        <dt className="text-muted-foreground">Most popular day</dt>
                        <dd className="text-right font-semibold text-foreground">{best.label}</dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                        <dt className="text-muted-foreground">Total picks</dt>
                        <dd className="font-semibold tabular-nums text-foreground">
                            {days.reduce(
                                (sum, day) => sum + day.slots.reduce((s, slot) => s + slot.count, 0),
                                0,
                            )}
                        </dd>
                    </div>
                </dl>
            </section>

            <TimezoneNote pollTimezone={timezone} />
        </div>
    );
}

/**
 * Only shown when the viewer is somewhere else. Times on the page are written
 * in the poll's zone, and silently showing them to someone in another zone is
 * exactly the confusion this rewrite set out to remove.
 */
function TimezoneNote({ pollTimezone }: { pollTimezone: string }) {
    // Resolved after mount: on the server this would report the server's zone
    // and the markup would not match what the browser renders.
    const [viewerTimezone, setViewerTimezone] = useState<string | null>(null);

    useEffect(() => setViewerTimezone(guessTimeZone()), []);

    if (!viewerTimezone || viewerTimezone === pollTimezone) return null;

    return (
        <section className="rounded-2xl border border-border bg-muted/40 p-4">
            <h2 className="mb-1 flex items-center gap-2 text-xs font-semibold text-foreground">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                Times are shown in {pollTimezone.replace('_', ' ')}
            </h2>
            <p className="text-xs leading-relaxed text-muted-foreground">
                That is the poll&apos;s time zone, not yours ({viewerTimezone.replace('_', ' ')}).
            </p>
        </section>
    );
}
