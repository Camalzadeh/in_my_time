'use client';

import { CalendarCheck, Users } from 'lucide-react';

import type { PublicPoll } from '@/lib/data/serialize';
import { formatInZone } from '@/lib/time/zone';

interface Props {
    poll: PublicPoll;
    currentVoterId: string;
    timezone: string;
}

export default function FinalizedPollView({ poll, currentVoterId, timezone }: Props) {
    const final = poll.finalTime ? new Date(poll.finalTime) : null;

    // Who said yes to the time that was actually chosen.
    const attending = final
        ? poll.votes.filter((vote) => vote.selectedSlots.includes(final.toISOString()))
        : [];

    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-card p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <CalendarCheck className="h-6 w-6 text-primary" aria-hidden />
                </div>

                <p className="text-sm font-medium text-muted-foreground">This poll is closed.</p>

                {final ? (
                    <>
                        <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">
                            {formatInZone(final, timezone)}
                        </p>
                        <p className="mt-1 text-muted-foreground">
                            {new Intl.DateTimeFormat('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                                timeZone: timezone,
                            }).format(final)}
                        </p>
                        <p className="mt-3 text-xs text-muted-foreground">
                            Times shown in {timezone.replace('_', ' ')}
                        </p>
                    </>
                ) : (
                    <p className="mt-2 text-muted-foreground">No final time was recorded.</p>
                )}
            </section>

            {final && (
                <section className="rounded-2xl border border-border bg-card p-5">
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Users className="h-4 w-4 text-muted-foreground" aria-hidden />
                        Available at this time ({attending.length} of {poll.votes.length})
                    </h2>

                    {attending.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Nobody picked this slot while voting was open.
                        </p>
                    ) : (
                        <ul className="flex flex-wrap gap-2">
                            {attending.map((vote) => (
                                <li
                                    key={vote.voterId}
                                    className="rounded-full border border-border bg-background px-3 py-1 text-sm text-foreground"
                                >
                                    {vote.voterName}
                                    {vote.voterId === currentVoterId && (
                                        <span className="ml-1 text-xs text-muted-foreground">(you)</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            )}
        </div>
    );
}
