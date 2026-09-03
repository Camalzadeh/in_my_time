'use client';

import { useState } from 'react';
import { Calendar, Check, Clock, Crown, Link as LinkIcon, Pencil, Users } from 'lucide-react';

import type { PublicPoll } from '@/lib/data/serialize';
import type { RealtimeStatus } from './PollRealtimeBridge';

interface Props {
    poll: PublicPoll;
    isOwner: boolean;
    voterName: string | null;
    /** Null when realtime is not configured at all. */
    realtimeStatus: RealtimeStatus | null;
    onEditName: () => void;
}

export default function PollHeader({ poll, isOwner, voterName, realtimeStatus, onEditName }: Props) {
    const [copied, setCopied] = useState(false);

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard is blocked outside secure contexts; the URL bar still works.
        }
    };

    const isOpen = poll.status === 'open';

    return (
        <header className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge tone={isOpen ? 'open' : 'closed'}>{isOpen ? 'Open' : 'Closed'}</Badge>

                        {isOwner && (
                            <Badge tone="owner">
                                <Crown className="h-3 w-3" aria-hidden /> Owner
                            </Badge>
                        )}

                        {realtimeStatus && <RealtimeBadge status={realtimeStatus} />}
                    </div>

                    <h1 className="text-2xl font-bold leading-tight text-foreground">{poll.title}</h1>

                    {poll.description && (
                        <p className="mt-2 text-sm text-muted-foreground">{poll.description}</p>
                    )}

                    <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        <Fact icon={<Clock className="h-4 w-4" aria-hidden />} label="Slot length">
                            {poll.config.slotDuration} min
                        </Fact>
                        <Fact icon={<Users className="h-4 w-4" aria-hidden />} label="Participants">
                            {poll.votes.length}
                        </Fact>
                        <Fact icon={<Calendar className="h-4 w-4" aria-hidden />} label="Days">
                            {poll.config.targetDates.length}
                        </Fact>
                    </dl>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                    <button
                        type="button"
                        onClick={copyLink}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        {copied ? (
                            <Check className="h-4 w-4" aria-hidden />
                        ) : (
                            <LinkIcon className="h-4 w-4" aria-hidden />
                        )}
                        {copied ? 'Copied' : 'Share'}
                    </button>

                    {voterName && (
                        <div className="border-l border-border pl-3">
                            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Voting as
                            </div>
                            <button
                                type="button"
                                onClick={onEditName}
                                className="group inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <span className="max-w-[140px] truncate">{voterName}</span>
                                <Pencil
                                    className="h-3 w-3 text-muted-foreground transition-colors group-hover:text-foreground"
                                    aria-hidden
                                />
                                <span className="sr-only">Change your name</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

function Fact({
    icon,
    label,
    children,
}: {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-center gap-1.5">
            {icon}
            <dt className="sr-only">{label}</dt>
            <dd>{children}</dd>
        </div>
    );
}

function Badge({ tone, children }: { tone: 'open' | 'closed' | 'owner'; children: React.ReactNode }) {
    const tones = {
        open: 'bg-primary/10 text-primary',
        closed: 'bg-muted text-muted-foreground',
        owner: 'bg-accent/15 text-accent',
    } as const;

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${tones[tone]}`}
        >
            {children}
        </span>
    );
}

function RealtimeBadge({ status }: { status: RealtimeStatus }) {
    const copy = {
        live: { label: 'Live', dot: 'bg-primary' },
        connecting: { label: 'Connecting', dot: 'bg-muted-foreground animate-pulse' },
        offline: { label: 'Offline', dot: 'bg-muted-foreground' },
    } as const;

    const { label, dot } = copy[status];

    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />
            {label}
        </span>
    );
}
