'use client';

import { useCallback, useMemo, useState } from 'react';

import type { PublicPoll } from '@/lib/data/serialize';
import { buildDisplayGrid, type GridRow } from '@/lib/time/display';
import { API_ROUTES } from '@/lib/routes';

export interface SlotView {
    iso: string;
    /** Wall-clock time in the *display* zone, e.g. "14:30". */
    label: string;
    count: number;
    voters: string[];
}

export interface DayView {
    /** "YYYY-MM-DD" in the display zone. */
    key: string;
    weekday: string;
    dayLabel: string;
    /** Picks across the whole column. */
    total: number;
    /**
     * One entry per row, in row order. Null where this day has no slot at that
     * time — which happens whenever the viewer's zone splits the poll's days
     * differently from the poll's own.
     */
    cells: (SlotView | null)[];
}

export interface RankedSlot {
    iso: string;
    label: string;
    dayLabel: string;
    weekday: string;
    count: number;
}

interface Args {
    poll: PublicPoll;
    pollId: string;
    voterId: string;
    voterName: string | null;
    isOwner: boolean;
    /** The zone the viewer is reading the poll in. */
    displayTimezone: string;
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

export function usePollManager({
    poll,
    pollId,
    voterId,
    voterName,
    isOwner,
    displayTimezone,
}: Args) {
    const [draft, setDraft] = useState<string[] | null>(null);
    const [isSaving, setIsSaving] = useState(false);

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

    // The instants are fixed; which day and which row they land on is a
    // question about the viewer, so the grid is rebuilt when the zone changes.
    const grid = useMemo(
        () => buildDisplayGrid(poll.config, displayTimezone),
        [poll.config, displayTimezone],
    );

    const rows: GridRow[] = grid.rows;

    const days: DayView[] = useMemo(
        () =>
            grid.days.map((day) => {
                let total = 0;

                const cells = grid.rows.map((row) => {
                    const iso = grid.cells.get(`${day.key}|${row.key}`);
                    if (!iso) return null;

                    const voters = votersBySlot.get(iso) ?? [];
                    total += voters.length;

                    return { iso, label: row.label, count: voters.length, voters };
                });

                return { ...day, total, cells };
            }),
        [grid, votersBySlot],
    );

    const maxVoteCount = useMemo(() => {
        let max = 1;
        for (const day of days) {
            for (const cell of day.cells) {
                if (cell && cell.count > max) max = cell.count;
            }
        }
        return max;
    }, [days]);

    const rankedSlots: RankedSlot[] = useMemo(() => {
        const ranked: RankedSlot[] = [];

        for (const day of days) {
            for (const cell of day.cells) {
                if (cell && cell.count > 0) {
                    ranked.push({
                        iso: cell.iso,
                        label: cell.label,
                        dayLabel: day.dayLabel,
                        weekday: day.weekday,
                        count: cell.count,
                    });
                }
            }
        }

        return ranked.sort((a, b) => b.count - a.count || a.iso.localeCompare(b.iso));
    }, [days]);

    /** Every slot in the poll, so "select all" and the like have something to work from. */
    const allSlotIsos = useMemo(() => [...grid.cells.values()], [grid]);

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

    /**
     * `nameOverride` exists for the moment someone types their name in order to
     * save: the new name is not in props yet, so it is passed straight through
     * rather than waiting a render for it to arrive.
     */
    const saveVote = useCallback(async (nameOverride?: string) => {
        const name = nameOverride ?? voterName;
        if (!voterId || !name || poll.status !== 'open') return;

        setIsSaving(true);
        try {
            await send(API_ROUTES.VOTE_POLL_API(pollId), 'POST', {
                voterId,
                voterName: name,
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
        rows,
        days,
        rankedSlots,
        maxVoteCount,
        allSlotIsos,

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
