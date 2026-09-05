'use client';

import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

import SiteHeader from '@/app/components/SiteHeader';

import type { PollPageData } from '@/lib/data/server/get-poll-data';
import { applyPollEvent, type PollEvent } from '@/lib/poll-state';
import { usePollManager } from '@/lib/hooks/use-poll-manager';
import { useDisplayTimezone } from '@/lib/hooks/use-display-timezone';
import useVoterIdentity from '@/lib/hooks/use-voter-identity';

import PollRealtimeBridge, { type RealtimeStatus } from './PollRealtimeBridge';
import NicknameModal from './NicknameModal';
import PollHeader from './PollHeader';
import PollTimezoneBar from './PollTimezoneBar';
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

    const { voterId, voterName, setVoterName } = useVoterIdentity();

    const [isNameModalOpen, setNameModalOpen] = useState(false);
    const [isFinalizeOpen, setFinalizeOpen] = useState(false);

    // Set when the name dialog was opened by an attempt to save, so the save
    // can carry on by itself once the name exists.
    const saveAfterNaming = useRef(false);

    const pollTimezone = poll.config.timezone;
    const { timezone, preference, setPreference } = useDisplayTimezone(pollTimezone);

    const manager = usePollManager({
        poll,
        pollId,
        voterId,
        voterName,
        isOwner: data.isOwner,
        displayTimezone: timezone,
    });

    const handleEvent = useCallback((event: PollEvent) => {
        setPoll((current) => applyPollEvent(current, event));
    }, []);

    const isOpen = poll.status === 'open';

    const persist = useCallback(async (nameOverride?: string) => {
        try {
            await manager.saveVote(nameOverride);
            toast.success('Your availability is saved.');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Could not save your vote.');
        }
    }, [manager]);

    // Nothing is gated behind the name until this point.
    //
    // The dialog used to open the moment the page loaded, before a visitor
    // could see the poll they had been sent a link to — a form standing between
    // someone and the thing they came to look at. The name is only needed to
    // attribute a vote, so it is asked for when a vote is actually saved.
    const save = () => {
        if (!voterName) {
            saveAfterNaming.current = true;
            setNameModalOpen(true);
            return;
        }

        void persist();
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

    const timezoneBar = (
        <PollTimezoneBar
            displayTimezone={timezone}
            pollTimezone={pollTimezone}
            preference={preference}
            onChange={setPreference}
        />
    );

    return (
        <>
            <SiteHeader />
            <main id="main" className="min-h-screen bg-background px-3 py-5 sm:px-4 sm:py-8">
                {data.realtimeEnabled && (
                    <PollRealtimeBridge
                        pollId={pollId}
                        onEvent={handleEvent}
                        onStatusChange={setRealtimeStatus}
                    />
                )}

                <NicknameModal
                    isOpen={isNameModalOpen}
                    initialName={voterName}
                    onSave={(name) => {
                        setVoterName(name);
                        setNameModalOpen(false);

                        if (saveAfterNaming.current) {
                            saveAfterNaming.current = false;
                            void persist(name);
                        }
                    }}
                    onClose={() => {
                        saveAfterNaming.current = false;
                        setNameModalOpen(false);
                    }}
                    dismissible
                />

                <FinalizePollModal
                    isOpen={isFinalizeOpen}
                    rankedSlots={manager.rankedSlots}
                    onClose={() => setFinalizeOpen(false)}
                    onConfirm={finalize}
                />

                <div className="mx-auto max-w-6xl space-y-6">
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
                            displayTimezone={timezone}
                            pollTimezone={pollTimezone}
                        />
                    ) : (
                        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                            <div className="space-y-6 lg:col-span-8">
                                <PollScheduleGrid
                                    rows={manager.rows}
                                    days={manager.days}
                                    selection={manager.selection}
                                    maxVoteCount={manager.maxVoteCount}
                                    // Picking is open to anyone; only saving
                                    // needs a name.
                                    disabled={manager.isSaving}
                                    onToggle={manager.toggleSlot}
                                    onSetMany={manager.setSlots}
                                    topBar={timezoneBar}
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
                                    onEnterName={save}
                                />
                            </div>

                            {/* The leaderboard sits here rather than under the
                                grid: in the left column it left the right one
                                empty from halfway down the page. */}
                            <div className="space-y-6 lg:col-span-4 lg:sticky lg:top-6">
                                <PollLeaderboard
                                    rankedSlots={manager.rankedSlots}
                                    maxVoteCount={manager.maxVoteCount}
                                />

                                <PollSidebarStats
                                    slotDuration={poll.config.slotDuration}
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
        </>
    );
}
