// PollRealtimeUpdates.tsx
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { configureAbly } from '@ably-labs/react-hooks';

import type { IPoll } from '@/types/Poll';
import usePollRealtime from "@/lib/data/realtime/use-poll-realtime";
import generateSlots from "@/lib/utils/generate-slots";
import NicknameModal from "@/app/components/poll/NicknameModal";
import PollHeader from "@/app/components/poll/PollHeader";
import DayNavigator from "@/app/components/poll/DayNavigator";
import PollScheduleGrid from "@/app/components/poll/PollScheduleGrid";
import PollFooter from "@/app/components/poll/PollFooter";
import useVoterIdentity from "@/lib/data/realtime/use-voter-identity";

interface PollRealtimeUpdatesProps {
    pollId: string;
    initialPollData: IPoll;
}

configureAbly({ authUrl: '/api/ably' });

interface ScheduleDayGroup {
    date: string;
    fullDate: string;
    slots: { time: string; fullIso: string; count: number; voters: string[] }[];
}


export default function PollRealtimeUpdates({ pollId, initialPollData }: PollRealtimeUpdatesProps) {
    const { poll } = usePollRealtime(pollId, initialPollData);

    const { voterId, voterName, isIdentityReady, setVoterName } = useVoterIdentity(poll.ownerId);

    const hasVoted = useMemo(() => {
        return poll.votes.some(v => v.voterId === voterId);
    }, [poll.votes, voterId]);

    const isOwner = poll.ownerId === voterId;

    const sendEmptyVote = useCallback(async (currentVoterId: string, currentVoterName: string) => {
        if (currentVoterId && currentVoterName && !hasVoted) {
            console.log("-> Sending initial empty vote:", currentVoterId, currentVoterName);
            try {
                const response = await fetch(`/api/polls/${pollId}/vote`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tempVoterId: currentVoterId,
                        voterName: currentVoterName,
                        selectedSlots: [],
                    }),
                });

                if (!response.ok) {
                    throw new Error('Initial vote failed.');
                }
            } catch (error) {
                console.error("Error sending initial empty vote:", error);
            }
        }
    }, [pollId, hasVoted]);


    useEffect(() => {
        if (isIdentityReady && voterId && voterName && !hasVoted) {
            sendEmptyVote(voterId, voterName);
        }
    }, [isIdentityReady, voterId, voterName, hasVoted, sendEmptyVote]);


    const handleSendVotes = async () => {
        if (mySelectedSlots.length === 0 || poll.status !== 'open' || !voterId || !voterName) return;

        try {
            const response = await fetch(`/api/poll/${pollId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tempVoterId: voterId,
                    voterName: voterName,
                    selectedSlots: mySelectedSlots,
                }),
            });

            if (!response.ok) {
                throw new Error('Voting failed.');
            }
        } catch (error) {
            console.error("Error sending vote:", error);
        }
    };


    const [currentDayIndex, setCurrentDayIndex] = useState(0);
    const [mySelectedSlots, setMySelectedSlots] = useState<string[]>([]);


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
                date: new Date(dateInput).toLocaleDateString('az-AZ', { weekday: 'long', day: 'numeric', month: 'long' }),
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


    const getSlotStyle = (count: number, iso: string): string => {
        const isSelected = mySelectedSlots.includes(iso);

        if (isSelected) {
            return "bg-indigo-600 border-indigo-700 text-white shadow-lg ring-2 ring-indigo-300 ring-offset-1 transform scale-105 z-10";
        }

        if (count === 0) return "bg-gray-50 border-gray-200 text-gray-400 hover:border-indigo-300 hover:bg-gray-100";

        const intensity = count / maxVoteCount;
        if (intensity < 0.3) return "bg-green-100 border-green-200 text-green-700 hover:border-green-300";
        if (intensity < 0.7) return "bg-green-300 border-green-400 text-green-900 hover:border-green-500";
        return "bg-green-500 border-green-600 text-white shadow-sm";
    };

    const handleSlotClick = (iso: string) => {
        setMySelectedSlots(prev => {
            if (prev.includes(iso)) {
                return prev.filter(item => item !== iso);
            } else {
                return [...prev, iso];
            }
        });
    };

    const handlePrevDay = () => setCurrentDayIndex(prev => Math.max(0, prev - 1));
    const handleNextDay = () => setCurrentDayIndex(prev => Math.min(scheduleData.length - 1, prev + 1));
    const handleDaySelect = (e: React.ChangeEvent<HTMLSelectElement>) => { setCurrentDayIndex(Number(e.target.value)); };

    const currentDayGroup = scheduleData[currentDayIndex];


    if (!isIdentityReady) {
        return <div className="text-center py-20">Loading data...</div>;
    }

    return (
        <main className="min-h-screen bg-gray-50 text-gray-900 py-10 px-4">

            {voterId && voterName === null && (
                <NicknameModal onSave={setVoterName} hasVoted={false}/>
            )}

            <div className="max-w-5xl mx-auto">

                <PollHeader poll={poll} isOwner={isOwner} voterName={voterName} />

                <DayNavigator
                    scheduleData={scheduleData}
                    currentDayIndex={currentDayIndex}
                    handlePrevDay={handlePrevDay}
                    handleNextDay={handleNextDay}
                    handleDaySelect={handleDaySelect}
                />

                <div className="min-h-[400px]">
                    <PollScheduleGrid
                        currentDayGroup={currentDayGroup}
                        currentDayIndex={currentDayIndex}
                        mySelectedSlots={mySelectedSlots}
                        getSlotStyle={getSlotStyle}
                        handleSlotClick={handleSlotClick}
                    />
                </div>

                <PollFooter
                    voteCount={poll.votes.length}
                    pollStatus={poll.status}
                    mySelectedSlotsCount={mySelectedSlots.length}
                    onSendVotes={handleSendVotes}
                    isVotingEnabled={voterName !== null}
                />
            </div>
        </main>
    );
}