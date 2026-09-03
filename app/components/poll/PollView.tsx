'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import type { PollPageData } from '@/lib/data/server/get-poll-data';
import { applyPollEvent, type PollEvent } from '@/lib/poll-state';
import { usePollManager } from '@/lib/hooks/use-poll-manager';
import useVoterIdentity from '@/lib/hooks/use-voter-identity';

import PollRealtimeBridge, { type RealtimeStatus } from './PollRealtimeBridge';
import NicknameModal from './NicknameModal';
import PollHeader from './PollHeader';
import PollScheduleGrid from './PollScheduleGrid';
import PollFooter from './PollFooter';
import PollLeaderboard from './PollLeaderboard';
import PollParticipants from './PollParticipants';
import PollSidebarStats from './PollSidebarStats';
import FinalizePollModal from './FinalizePollModal';
import FinalizedPollView from './FinalizedPollView';

interface Props {
    pollId: string;
    data: PollPageData;
}

export default function PollView({ pollId, data }: Props) {
    const [poll, setPoll] = useState(data.poll);
    const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>(
        data.realtimeEnabled ? 'connecting' : 'offline',
    );

    const { voterId, voterName, isIdentityReady, setVoterName } = useVoterIdentity();

    const [isNameModalOpen, setNameModalOpen] = useState(false);
    const [isFinalizeOpen, setFinalizeOpen] = useState(false);

    const manager = usePollManager({
        poll,
        pollId,
        voterId,
        voterName,
        isOwner: data.isOwner,
    });

    const handleEvent = useCallback((event: PollEvent) => {
        setPoll((current) => applyPollEvent(current, event));
    }, []);

    const isOpen = poll.status === 'open';
    const needsName = isIdentityReady && voterName === null;

    const save = async () => {
        try {
            await manager.saveVote();
            toast.success('Your availability is saved.');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Could not save your vote.');
        }
    };

    const clear = async (targetVoterId: string) => {
        try {
            await manager.clearVote(targetVoterId);
            toast.success('Vote cleared.');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Could not clear the vote.');
        }
    };

    const finalize = async (finalSlot: string) => {
        try {
            await manager.finalizePoll(finalSlot);
            setFinalizeOpen(false);
            toast.success('Poll closed.');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Could not close the poll.');
        }
    };

    return (
        <main className="min-h-screen bg-background px-4 py-8">
            {data.realtimeEnabled && (
                <PollRealtimeBridge
                    pollId={pollId}
                    onEvent={handleEvent}
                    onStatusChange={setRealtimeStatus}
                />
            )}

            <NicknameModal
                isOpen={isNameModalOpen || (isOpen && needsName)}
                initialName={voterName}
                onSave={(name) => {
                    setVoterName(name);
                    setNameModalOpen(false);
                }}
                onClose={() => setNameModalOpen(false)}
                // The name is required to vote, so it cannot be dismissed until set.
                dismissible={!needsName}
            />

            <FinalizePollModal
                isOpen={isFinalizeOpen}
                rankedSlots={manager.rankedSlots}
                onClose={() => setFinalizeOpen(false)}
                onConfirm={finalize}
            />

            <div className="mx-auto max-w-6xl space-y-6">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-lg px-2 py-1 -ml-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <ArrowLeft className="h-4 w-4" aria-hidden />
                    Home
                </Link>

                <PollHeader
                    poll={poll}
                    isOwner={data.isOwner}
                    voterName={voterName}
                    realtimeStatus={data.realtimeEnabled ? realtimeStatus : null}
                    onEditName={() => setNameModalOpen(true)}
                />

                {!isOpen ? (
                    <FinalizedPollView
                        poll={poll}
                        currentVoterId={voterId}
                        timezone={manager.timezone}
                    />
                ) : (
                    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                        <div className="space-y-6 lg:col-span-8">
                            <PollScheduleGrid
                                days={manager.days}
                                selection={manager.selection}
                                maxVoteCount={manager.maxVoteCount}
                                disabled={!voterName || manager.isSaving}
                                timezone={manager.timezone}
                                onToggle={manager.toggleSlot}
                                onSetMany={manager.setSlots}
                            />

                            <PollFooter
                                participantCount={poll.votes.length}
                                selectedCount={manager.selection.length}
                                hasUnsavedChanges={manager.hasUnsavedChanges}
                                hasName={voterName !== null}
                                isSaving={manager.isSaving}
                                isOwner={data.isOwner}
                                onSave={save}
                                onDiscard={manager.resetDraft}
                                onFinalize={() => setFinalizeOpen(true)}
                                onEnterName={() => setNameModalOpen(true)}
                            />

                            <PollLeaderboard
                                rankedSlots={manager.rankedSlots}
                                maxVoteCount={manager.maxVoteCount}
                            />
                        </div>

                        <div className="space-y-6 lg:col-span-4 lg:sticky lg:top-6">
                            <PollSidebarStats
                                slotDuration={poll.config.slotDuration}
                                timezone={manager.timezone}
                                days={manager.days}
                            />

                            <PollParticipants
                                votes={poll.votes}
                                currentVoterId={voterId}
                                isOwner={data.isOwner}
                                onClearVote={clear}
                            />
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
