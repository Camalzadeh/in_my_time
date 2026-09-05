import { Trophy } from 'lucide-react';

import type { RankedSlot } from '@/lib/hooks/use-poll-manager';

interface Props {
    rankedSlots: RankedSlot[];
    maxVoteCount: number;
}

const TOP_N = 5;

export default function PollLeaderboard({ rankedSlots, maxVoteCount }: Props) {
    if (rankedSlots.length === 0) return null;

    const top = rankedSlots.slice(0, TOP_N);

    return (
        <section className="rounded-2xl border border-border bg-card p-5" aria-labelledby="top-times">
            <div className="mb-4 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-accent" aria-hidden />
                <h2 id="top-times" className="text-sm font-semibold text-foreground">
                    Best times so far
                </h2>
            </div>

            <ol className="space-y-2">
                {top.map((slot, index) => {
                    const percentage = Math.round((slot.count / maxVoteCount) * 100);

                    return (
                        <li
                            key={slot.iso}
                            className="relative overflow-hidden rounded-xl border border-border bg-background p-3"
                        >
                            {/* Width doubles as the bar; the number next to it is the real value. */}
                            <div
                                className="absolute inset-y-0 left-0 bg-primary/10"
                                style={{ width: `${percentage}%` }}
                                aria-hidden
                            />

                            <div className="relative flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="w-5 text-xs font-bold tabular-nums text-muted-foreground">
                                        {index + 1}
                                    </span>
                                    <div>
                                        <div className="text-sm font-semibold tabular-nums text-foreground">
                                            {slot.label}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {slot.weekday}, {slot.dayLabel}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-sm font-bold tabular-nums text-foreground">
                                        {slot.count}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">
                                        {percentage}%
                                    </div>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}
