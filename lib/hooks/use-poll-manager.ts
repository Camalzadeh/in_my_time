import { useState, useMemo, useEffect, useCallback } from 'react';
import { IPoll } from '@/types/Poll';
import generateSlots from "@/lib/utils/generate-slots";
import {API_ROUTES} from "@/lib/routes";

interface ScheduleDayGroup {
    date: string;
    fullDate: string;
    slots: { time: string; fullIso: string; count: number; voters: string[] }[];
}

interface RankedSlot {
    fullIso: string;
    time: string;
    date: string;
    count: number;
}

export function usePollManager(poll: IPoll, pollId: string, voterId: string, voterName: string | null) {
    const [initialSelectedSlots, setInitialSelectedSlots] = useState<string[]>([]);
    const [currentSelections, setCurrentSelections] = useState<string[]>([]);

    const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);

    const hasVoted = useMemo(() => poll.votes.some(v => v.voterId === voterId), [poll.votes, voterId]);
    const isOwner = poll.ownerId === voterId;

    const areSelectionsDifferent = useMemo(() => {
        const currentSorted = [...currentSelections].sort().join(',');
        const initialSorted = [...initialSelectedSlots].sort().join(',');
        return currentSorted !== initialSorted;
    }, [currentSelections, initialSelectedSlots]);

    const scheduleData: ScheduleDayGroup[] = useMemo(() => {
        const groups: ScheduleDayGroup[] = [];
        poll.config.targetDates.forEach((dateInput) => {
            const rawSlots = generateSlots(
                dateInput,
                poll.config.dailyStartTime,
                poll.config.dailyEndTime,
                poll.config.slotDuration
            );

            const processedSlots = rawSlots.map(slotIso => {
                const votersForSlot = poll.votes.filter(v =>
                    (v.selectedSlots as unknown as string[]).includes(slotIso)
                );

                return {
                    fullIso: slotIso,
                    time: new Date(slotIso).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' }),
                    count: votersForSlot.length,
                    voters: votersForSlot.map(v => v.voterName)
                };
            });

            groups.push({
                date: new Date(dateInput).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
                fullDate: new Date(dateInput).toISOString(),
                slots: processedSlots
            });
        });
        return groups;
    }, [poll]);

    const maxVoteCount = useMemo(() => Math.max(
        ...scheduleData.flatMap(d => d.slots.map(s => s.count)),
        1
    ), [scheduleData]);

    const leaderboard = useMemo(() => {
        const allSlots: { time: string; date: string; count: number; iso: string }[] = [];
        scheduleData.forEach(day => {
            day.slots.forEach(slot => {
                if (slot.count > 0) {
                    allSlots.push({ time: slot.time, date: day.date, count: slot.count, iso: slot.fullIso });
                }
            });
        });
        return allSlots.sort((a, b) => b.count - a.count).slice(0, 5);
    }, [scheduleData]);

    const rankedSlots: RankedSlot[] = useMemo(() => {
        const all: RankedSlot[] = [];
        scheduleData.forEach(day => {
            day.slots.forEach(slot => {
                if (slot.count > 0) {
                    all.push({
                        fullIso: slot.fullIso,
                        time: slot.time,
                        date: day.date,
                        count: slot.count
                    });
                }
            });
        });
        return all.sort((a, b) => b.count - a.count);
    }, [scheduleData]);


    useEffect(() => {
        if (!voterId) return;

        const myVote = poll.votes.find(v => v.voterId === voterId);
        const latestSlots = (myVote?.selectedSlots || []).map(slot =>
            (slot instanceof Date) ? slot.toISOString() : slot
        ) as string[];

        const latestSorted = [...latestSlots].sort().join(',');
        const initialSorted = [...initialSelectedSlots].sort().join(',');

        if (latestSorted !== initialSorted) {
            setInitialSelectedSlots(latestSlots);
            setCurrentSelections(latestSlots);
        }
    }, [voterId, poll.votes, initialSelectedSlots]);

    const sendEmptyVote = useCallback(async (currId: string, currName: string) => {
        try {
            await fetch(API_ROUTES.VOTE_POLL_API(pollId), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tempVoterId: currId, voterName: currName, selectedSlots: [] }),
            });
        } catch (error) {
            console.error(error);
        }
    }, [pollId]);

    useEffect(() => {
        if (voterId && voterName && !hasVoted) {
            sendEmptyVote(voterId, voterName);
        }
    }, [voterId, voterName, hasVoted, sendEmptyVote]);



    const handleSlotClick = (iso: string) => {
        setCurrentSelections(prev => prev.includes(iso) ? prev.filter(i => i !== iso) : [...prev, iso]);
    };

    const handleSendVotes = async () => {
        if (poll.status !== 'open' || !voterId || !voterName) return;
        try {
            const response = await fetch(API_ROUTES.VOTE_POLL_API(pollId), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tempVoterId: voterId, voterName: voterName, selectedSlots: currentSelections }),
            });
            if (!response.ok) throw new Error('Failed');
        } catch (error) {
            console.error(error);
        }
    };

    const handleClearVote = async (targetVoterId: string, targetVoterName: string) => {
        try {
            const response = await fetch(API_ROUTES.VOTE_POLL_API(pollId), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tempVoterId: targetVoterId, voterName: targetVoterName, selectedSlots: [] }),
            });
            if (!response.ok) throw new Error('Failed');
            if (targetVoterId === voterId) setCurrentSelections([]);
        } catch (error) {
            console.error(error);
        }
    };

    const openFinalizeModal = () => setIsFinalizeModalOpen(true);
    const closeFinalizeModal = () => setIsFinalizeModalOpen(false);

    const confirmFinalizePoll = async (finalIso: string) => {
        try {
            const response = await fetch(API_ROUTES.FINALIZE_POLL_API(pollId), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'closed',
                    finalDate: finalIso
                }),
            });

            if (!response.ok) throw new Error('Failed to finalize poll');

            setIsFinalizeModalOpen(false);
        } catch (error) {
            console.error("Error finalizing poll:", error);
            alert("Failed to finalize poll. Please try again.");
        }
    };

    const getSlotStyle = (count: number, iso: string): string => {
        const isSelected = currentSelections.includes(iso);
        const isInitiallySelected = initialSelectedSlots.includes(iso);
        const isMarkedForDeletion = isInitiallySelected && !isSelected;
        const isNewlyAdded = isSelected && !isInitiallySelected;

        if (isNewlyAdded) return "bg-indigo-600 border-indigo-700 text-white shadow-lg ring-2 ring-indigo-300 ring-offset-1 transform scale-105 z-10";
        if (isMarkedForDeletion) return "bg-red-50 border-red-200 text-red-800 opacity-60 hover:opacity-100 line-through decoration-red-500";
        if (isInitiallySelected && isSelected) return "bg-blue-100 border-blue-300 text-blue-900 shadow-sm font-medium";
        if (count === 0) return "bg-white border-gray-200 text-gray-400 hover:border-indigo-300 hover:bg-gray-50";

        const intensity = count / maxVoteCount;
        if (intensity < 0.3) return "bg-emerald-50 border-emerald-200 text-emerald-700 hover:border-emerald-300";
        if (intensity < 0.7) return "bg-emerald-200 border-emerald-300 text-emerald-900 hover:border-emerald-400";
        return "bg-emerald-500 border-emerald-600 text-white shadow-sm";
    };

    return {
        scheduleData,
        leaderboard,
        maxVoteCount,
        rankedSlots,

        isOwner,
        hasVoted,
        currentSelections,
        initialSelectedSlots,
        areSelectionsDifferent,

        isFinalizeModalOpen,

        handleSlotClick,
        handleSendVotes,
        handleClearVote,
        openFinalizeModal,
        closeFinalizeModal,
        confirmFinalizePoll,
        getSlotStyle
    };
}