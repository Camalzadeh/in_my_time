import Link from 'next/link';
import { CalendarCheck, CalendarDays, Clock, Crown, Plus, Users, Vote } from 'lucide-react';

import type { MyPolls, PollSummary } from '@/lib/data/server/get-my-polls';
import { UI_PATHS } from '@/lib/routes';
import { zoneCityName } from '@/lib/time/zone';

// The page someone lands on once they have polls of their own.
//
// Until now a poll existed only as a link: lose the message it arrived in and
// it was gone, because there is no account to look it up under. This is the
// index that was missing — assembled from the tokens this browser already
// holds, so it stays true to the no-sign-up premise rather than quietly
// introducing one.

/** "2026-09-14" read as a plain day, with no zone applied to it. */
function formatDay(date: string): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
    }).format(new Date(`${date}T12:00:00Z`));
}

function dateRange(poll: PollSummary): string {
    if (!poll.firstDate) return 'No days';
    if (!poll.lastDate || poll.firstDate === poll.lastDate) return formatDay(poll.firstDate);

    return `${formatDay(poll.firstDate)} – ${formatDay(poll.lastDate)}`;
}

function PollCard({ poll }: { poll: PollSummary }) {
    const isOpen = poll.status === 'open';

    return (
        <li>
            <Link
                href={UI_PATHS.POLL_DETAIL(poll.id)}
                className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-ring/50 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                            isOpen ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                        }`}
                    >
                        {isOpen ? 'Open' : 'Closed'}
                    </span>

                    {poll.isOwner && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-accent">
                            <Crown className="h-3 w-3" aria-hidden />
                            Yours
                        </span>
                    )}

                    {poll.votedAs && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                            <Vote className="h-3 w-3" aria-hidden />
                            Voted as {poll.votedAs}
                        </span>
                    )}
                </div>

                <h3 className="text-base font-semibold leading-snug text-foreground group-hover:text-primary">
                    {poll.title}
                </h3>

                <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                        <dt className="sr-only">Days</dt>
                        <dd>
                            {dateRange(poll)}
                            {poll.dayCount > 1 && ` · ${poll.dayCount} days`}
                        </dd>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" aria-hidden />
                        <dt className="sr-only">Participants</dt>
                        <dd>
                            {poll.participantCount}{' '}
                            {poll.participantCount === 1 ? 'person' : 'people'}
                        </dd>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" aria-hidden />
                        <dt className="sr-only">Slot length</dt>
                        <dd>
                            {poll.slotDuration} min · {zoneCityName(poll.timezone)}
                        </dd>
                    </div>
                </dl>

                {poll.finalTime && (
                    <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
                        <CalendarCheck className="h-3.5 w-3.5 text-primary" aria-hidden />
                        Settled
                    </p>
                )}
            </Link>
        </li>
    );
}

function Section({
    title,
    hint,
    polls,
}: {
    title: string;
    hint: string;
    polls: PollSummary[];
}) {
    if (polls.length === 0) return null;

    return (
        <section>
            {/* The hint used to sit opposite the heading, which on a wide
                screen stranded it against the far edge with nothing near it. */}
            <div className="mb-3">
                <h2 className="text-lg font-bold text-foreground">
                    {title}{' '}
                    <span className="ml-1 text-sm font-medium text-muted-foreground">
                        {polls.length}
                    </span>
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
                {polls.map((poll) => (
                    <PollCard key={poll.id} poll={poll} />
                ))}
            </ul>
        </section>
    );
}

export default function MyPollsView({ created, voted }: MyPolls) {
    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Your polls</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Everything this device has made or voted in. No account needed — which also
                        means clearing your browser data clears this list.
                    </p>
                </div>

                <Link
                    href={UI_PATHS.CREATE_POLL}
                    className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                    <Plus className="h-4 w-4" aria-hidden />
                    New poll
                </Link>
            </div>

            <Section
                title="You created"
                hint="You can close these and pick the final time."
                polls={created}
            />

            <Section title="You voted in" hint="Your picks are saved on this device." polls={voted} />
        </div>
    );
}
