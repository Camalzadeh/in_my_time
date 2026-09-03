'use client';

import { Trash2, Users } from 'lucide-react';

import type { PublicVote } from '@/lib/data/serialize';

interface Props {
    votes: PublicVote[];
    currentVoterId: string;
    isOwner: boolean;
    onClearVote: (voterId: string) => void;
}

function initials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
}

export default function PollParticipants({ votes, currentVoterId, isOwner, onClearVote }: Props) {
    if (votes.length === 0) {
        return (
            <section className="rounded-2xl border border-border bg-card p-5">
                <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Users className="h-4 w-4 text-muted-foreground" aria-hidden />
                    Participants
                </h2>
                <p className="text-sm text-muted-foreground">
                    Nobody has voted yet. Share the link to get started.
                </p>
            </section>
        );
    }

    return (
        <section className="rounded-2xl border border-border bg-card p-5" aria-labelledby="participants">
            <div className="mb-4 flex items-center justify-between">
                <h2
                    id="participants"
                    className="flex items-center gap-2 text-sm font-semibold text-foreground"
                >
                    <Users className="h-4 w-4 text-muted-foreground" aria-hidden />
                    Participants
                </h2>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                    {votes.length}
                </span>
            </div>

            <ul className="space-y-1.5">
                {votes.map((vote) => {
                    const isMe = vote.voterId === currentVoterId;
                    const canClear = isMe || isOwner;

                    return (
                        <li
                            key={vote.voterId}
                            className="flex items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 py-2"
                        >
                            <div className="flex min-w-0 items-center gap-2.5">
                                <span
                                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary"
                                    aria-hidden
                                >
                                    {initials(vote.voterName)}
                                </span>

                                <div className="min-w-0">
                                    <div className="truncate text-sm font-medium text-foreground">
                                        {vote.voterName}
                                        {isMe && (
                                            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                                                (you)
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {vote.selectedSlots.length}{' '}
                                        {vote.selectedSlots.length === 1 ? 'slot' : 'slots'}
                                    </div>
                                </div>
                            </div>

                            {canClear && (
                                <button
                                    type="button"
                                    onClick={() => onClearVote(vote.voterId)}
                                    className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                                    <span className="sr-only">
                                        Clear {isMe ? 'your vote' : `${vote.voterName}'s vote`}
                                    </span>
                                </button>
                            )}
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
