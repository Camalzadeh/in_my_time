'use client';

import { useCallback, useMemo, useState } from 'react';

import type { PublicPoll } from '@/lib/data/serialize';
import { generateSlotsForDate, slotLabel } from '@/lib/time/slots';
import { API_ROUTES } from '@/lib/routes';

export interface SlotView {
    iso: string;
    /** Wall-clock time in the poll's zone, e.g. "14:30". */
    label: string;
    count: number;
    voters: string[];
}

export interface DayView {
    /** "YYYY-MM-DD" */
    date: string;
    weekday: string;
    dayLabel: string;
    slots: SlotView[];
}

export interface RankedSlot {
    iso: string;
    label: string;
    date: string;
    weekday: string;
    count: number;
}

interface Args {
    poll: PublicPoll;
    pollId: string;
    voterId: string;
    voterName: string | null;
    isOwner: boolean;
}

async function send(url: string, method: 'POST' | 'DELETE', body: unknown) {
    const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message ?? 'Something went wrong. Please try again.');
    }

    return response.json().catch(() => null);
}

export function usePollManager({ poll, pollId, voterId, voterName, isOwner }: Args) {
    const [draft, setDraft] = useState<string[] | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const timezone = poll.config.timezone;

    const myVote = useMemo(
        () => poll.votes.find((vote) => vote.voterId === voterId) ?? null,
        [poll.votes, voterId],
    );

    const savedSelection = useMemo(() => myVote?.selectedSlots ?? [], [myVote]);

    // While `draft` is null we show what the server has. The first click starts
    // a draft, so an incoming realtime update cannot wipe unsaved choices.
    const selection = draft ?? savedSelection;

    const hasUnsavedChanges = useMemo(() => {
        if (draft === null) return false;
        if (draft.length !== savedSelection.length) return true;

        const saved = new Set(savedSelection);
        return draft.some((iso) => !saved.has(iso));
    }, [draft, savedSelection]);

    /**
     * Slot → voters index.
     *
     * The old code filtered every vote with `.includes()` for every slot, on
     * every render — days × slots × voters × slots-per-vote comparisons. At 60
     * days and 50 participants that ran into tens of millions. The index is
     * built once and lookups are constant time.
     */
    const votersBySlot = useMemo(() => {
        const index = new Map<string, string[]>();

        for (const vote of poll.votes) {
            for (const iso of vote.selectedSlots) {
                const existing = index.get(iso);
                if (existing) existing.push(vote.voterName);
                else index.set(iso, [vote.voterName]);
            }
        }

        return index;
    }, [poll.votes]);

    const days: DayView[] = useMemo(() => {
        const { dailyStartTime, dailyEndTime, slotDuration } = poll.config;

        return poll.config.targetDates.map((date) => {
            const slots = generateSlotsForDate(date, {
                dailyStartTime,
                dailyEndTime,
                slotDuration,
                timezone,
            });

            // Format the day name from the date string itself, pinned to UTC:
            // "10 September" is the day in the poll's zone, not the viewer's.
            const noon = new Date(`${date}T12:00:00Z`);

            return {
                date,
                weekday: new Intl.DateTimeFormat('en-US', {
                    weekday: 'long',
                    timeZone: 'UTC',
                }).format(noon),
                dayLabel: new Intl.DateTimeFormat('en-US', {
                    month: 'short',
                    day: 'numeric',
                    timeZone: 'UTC',
                }).format(noon),
                slots: slots.map((slot) => {
                    const iso = slot.toISOString();
                    const voters = votersBySlot.get(iso) ?? [];

                    return { iso, label: slotLabel(slot, timezone), count: voters.length, voters };
                }),
            };
        });
    }, [poll.config, timezone, votersBySlot]);

    const maxVoteCount = useMemo(() => {
        let max = 1;
        for (const day of days) {
            for (const slot of day.slots) {
                if (slot.count > max) max = slot.count;
            }
        }
        return max;
    }, [days]);

    const rankedSlots: RankedSlot[] = useMemo(() => {
        const ranked: RankedSlot[] = [];

        for (const day of days) {
            for (const slot of day.slots) {
                if (slot.count > 0) {
                    ranked.push({
                        iso: slot.iso,
                        label: slot.label,
                        date: day.dayLabel,
                        weekday: day.weekday,
                        count: slot.count,
                    });
                }
            }
        }

        return ranked.sort((a, b) => b.count - a.count || a.iso.localeCompare(b.iso));
    }, [days]);

    const toggleSlot = useCallback(
        (iso: string) => {
            setDraft((previous) => {
                const base = previous ?? savedSelection;
                return base.includes(iso) ? base.filter((s) => s !== iso) : [...base, iso];
            });
        },
        [savedSelection],
    );

    const setSlots = useCallback(
        (isos: string[], selected: boolean) => {
            setDraft((previous) => {
                const base = new Set(previous ?? savedSelection);
                for (const iso of isos) {
                    if (selected) base.add(iso);
                    else base.delete(iso);
                }
                return [...base];
            });
        },
        [savedSelection],
    );

    const resetDraft = useCallback(() => setDraft(null), []);

    const saveVote = useCallback(async () => {
        if (!voterId || !voterName || poll.status !== 'open') return;

        setIsSaving(true);
        try {
            await send(API_ROUTES.VOTE_POLL_API(pollId), 'POST', {
                voterId,
                voterName,
                selectedSlots: selection,
            });
            // The saved state now comes back as the source of truth.
            setDraft(null);
        } finally {
            setIsSaving(false);
        }
    }, [pollId, voterId, voterName, poll.status, selection]);

    const clearVote = useCallback(
        async (targetVoterId: string) => {
            await send(API_ROUTES.VOTE_POLL_API(pollId), 'DELETE', { voterId: targetVoterId });
            if (targetVoterId === voterId) setDraft(null);
        },
        [pollId, voterId],
    );

    const finalizePoll = useCallback(
        async (finalSlot: string) => {
            await send(API_ROUTES.FINALIZE_POLL_API(pollId), 'POST', { finalSlot });
        },
        [pollId],
    );

    return {
        days,
        rankedSlots,
        maxVoteCount,
        timezone,

        isOwner,
        hasVoted: myVote !== null,
        selection,
        savedSelection,
        hasUnsavedChanges,
        isSaving,

        toggleSlot,
        setSlots,
        resetDraft,
        saveVote,
        clearVote,
        finalizePoll,
    };
}
