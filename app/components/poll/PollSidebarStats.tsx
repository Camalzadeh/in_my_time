import { Info } from 'lucide-react';

import type { DayView } from '@/lib/hooks/use-poll-manager';

interface Props {
    slotDuration: number;
    days: DayView[];
}

// The time-zone note that used to live here is gone: it only warned that the
// times were somebody else's, which is no longer true. PollTimezoneBar sits on
// the grid itself and says which clock is being used, because that belongs next
// to the numbers rather than in a sidebar people scroll past.

export default function PollSidebarStats({ slotDuration, days }: Props) {
    const totalPicks = days.reduce((sum, day) => sum + day.total, 0);

    const best = days.reduce<{ label: string; count: number }>(
        (winner, day) =>
            day.total > winner.count
                ? { label: `${day.weekday}, ${day.dayLabel}`, count: day.total }
                : winner,
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
                        <dd className="font-semibold tabular-nums text-foreground">{totalPicks}</dd>
                    </div>
                </dl>
            </section>
        </div>
    );
}
