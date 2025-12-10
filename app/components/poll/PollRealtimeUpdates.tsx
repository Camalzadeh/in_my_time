'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { configureAbly } from '@ably-labs/react-hooks';
import { Home, Loader2, Zap } from 'lucide-react';

import type { IPoll } from '@/types/Poll';
import { usePollManager } from "@/lib/hooks/use-poll-manager";

import NicknameModal from "@/app/components/poll/NicknameModal";
import PollHeader from "@/app/components/poll/PollHeader";
import DayNavigator from "@/app/components/poll/DayNavigator";
import PollScheduleGrid from "@/app/components/poll/PollScheduleGrid";
import PollFooter from "@/app/components/poll/PollFooter";
import PollLeaderboard from "@/app/components/poll/PollLeaderboard";
import PollParticipants from "@/app/components/poll/PollParticipants";
import PollSidebarStats from "@/app/components/poll/PollSidebarStats";
import FinalizePollModal from "@/app/components/poll/FinalizePollModal";

import usePollRealtime from "@/lib/hooks/use-poll-realtime";
import useVoterIdentity from "@/lib/hooks/use-voter-identity";
import FinalizedPollView from "@/app/components/poll/FinalizedPollView";

interface PollRealtimeUpdatesProps {
    pollId: string;
    initialPollData: IPoll;
}

configureAbly({ authUrl: '/api/ably' });

export default function PollRealtimeUpdates({ pollId, initialPollData }: PollRealtimeUpdatesProps) {
    const { poll } = usePollRealtime(pollId, initialPollData);
    const { voterId, voterName, isIdentityReady, setVoterName } = useVoterIdentity();
    const manager = usePollManager(poll, pollId, voterId, voterName);

    const [currentDayIndex, setCurrentDayIndex] = useState(0);
    const [isNameModalOpen, setIsNameModalOpen] = useState(false);

    const handlePrevDay = () => setCurrentDayIndex(prev => Math.max(0, prev - 1));
    const handleNextDay = () => setCurrentDayIndex(prev => Math.min(manager.scheduleData.length - 1, prev + 1));
    const currentDayGroup = manager.scheduleData[currentDayIndex];

    if (!isIdentityReady) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    <div className="text-gray-600 font-semibold text-lg">
                        Loading Poll Data...
                    </div>
                    <div className="text-xs text-gray-400">
                        Establishing real-time connection <Zap className="w-3 h-3 inline ml-1" />
                    </div>
                </div>
            </div>
        );
    }

    if (poll.status !== 'open') {
        return (
            <main className="min-h-screen bg-gray-50/50 py-10 px-4">
                <div className="max-w-4xl mx-auto space-y-8 relative z-10">
                    <div className="flex items-center">
                        <Link
                            href="/"
                            className="group flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-all bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-2xl shadow-sm hover:shadow-md border border-gray-200/60"
                        >
                            <Home className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                            <span className="text-sm font-semibold">Home</span>
                        </Link>
                    </div>

                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
                        {poll.title}
                    </h1>

                    <FinalizedPollView
                        poll={poll}
                        isOwner={manager.isOwner}
                        currentVoterId={voterId}
                        onClearVote={manager.handleClearVote}
                    />

                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50/50 py-10 px-4 relative">

            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-200/20 blur-[120px]" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-purple-200/20 blur-[120px]" />
            </div>

            <NicknameModal
                isOpen={isNameModalOpen || (!!voterId && voterName === null)}
                onClose={() => setIsNameModalOpen(false)}
                onSave={setVoterName}
                initialName={voterName}
            />
            <FinalizePollModal
                isOpen={manager.isFinalizeModalOpen}
                onClose={manager.closeFinalizeModal}
                onConfirm={manager.confirmFinalizePoll}
                rankedSlots={manager.rankedSlots}
            />

            <div className="max-w-6xl mx-auto space-y-8 relative z-10">
                <div className="flex items-center justify-between">
                    <Link
                        href="/"
                        className="group flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-all bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-2xl shadow-sm hover:shadow-md border border-gray-200/60"
                    >
                        <Home className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        <span className="text-sm font-semibold">Home</span>
                    </Link>
                </div>

                <PollHeader
                    poll={poll}
                    isOwner={manager.isOwner}
                    voterName={voterName}
                    onEditName={() => setIsNameModalOpen(true)}
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-8 space-y-6">
                        <DayNavigator
                            scheduleData={manager.scheduleData}
                            currentDayIndex={currentDayIndex}
                            handlePrevDay={handlePrevDay}
                            handleNextDay={handleNextDay}
                            handleDaySelect={() => {}}
                            onSelectIndex={setCurrentDayIndex}
                        />

                        <div className="min-h-[500px]">
                            <PollScheduleGrid
                                currentDayGroup={currentDayGroup}
                                currentDayIndex={currentDayIndex}
                                mySelectedSlots={manager.currentSelections}
                                getSlotStyle={manager.getSlotStyle}
                                handleSlotClick={manager.handleSlotClick}
                            />
                        </div>

                        <PollFooter
                            voteCount={poll.votes.length}
                            pollStatus={poll.status}
                            mySelectedSlotsCount={manager.currentSelections.length}
                            onSendVotes={manager.handleSendVotes}
                            isOwner={manager.isOwner}
                            hasVoterName={voterName !== null}
                            hasUnsavedChanges={manager.areSelectionsDifferent}
                            onFinalizePoll={manager.openFinalizeModal}
                        />

                        <div className="pt-4">
                            <PollLeaderboard leaderboard={manager.leaderboard} maxVoteCount={manager.maxVoteCount} />
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-6 sticky top-6">
                        <PollSidebarStats
                            slotDuration={poll.config.slotDuration}
                            scheduleData={manager.scheduleData}
                        />

                        {poll.votes.length > 0 && (
                            <PollParticipants
                                votes={poll.votes}
                                currentVoterId={voterId}
                                isOwner={manager.isOwner}
                                onClearVote={manager.handleClearVote}
                            />
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}