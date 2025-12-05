// components/poll/PollFooter.tsx
import React from 'react';
import { MousePointerClick } from 'lucide-react';
import type { IPoll } from '@/types/Poll';

interface PollFooterProps {
    voteCount: number;
    pollStatus: IPoll['status'];
    mySelectedSlotsCount: number;
    onSendVotes: () => Promise<void>;
    isVotingEnabled: boolean;
}

export default function PollFooter({ voteCount, pollStatus, mySelectedSlotsCount, onSendVotes, isVotingEnabled }: PollFooterProps) {
    const isPollOpen = pollStatus === 'open';

    // Voting is disabled if: 1) No slots selected, OR 2) Poll is closed, OR 3) Voter name hasn't been set.
    const isDisabled = mySelectedSlotsCount === 0 || !isPollOpen || !isVotingEnabled;

    const statusText = isPollOpen ? 'Open' : 'Closed';
    const statusColor = isPollOpen ? 'text-green-600' : 'text-red-600';

    return (
        <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">

                {/* Left Side: Statistics */}
                <div className="flex gap-8 text-center md:text-left">
                    <div>
                        <div className="text-2xl font-bold text-gray-900">{voteCount}</div>
                        <div className="text-gray-500 text-xs uppercase tracking-wide">Participants</div>
                    </div>
                    <div>
                        <div className={`text-2xl font-bold ${statusColor}`}>
                            {statusText}
                        </div>
                        <div className="text-gray-500 text-xs uppercase tracking-wide">Status</div>
                    </div>
                </div>

                {/* Right Side: Send Vote Button */}
                <div className="w-full md:w-auto">
                    <button
                        onClick={onSendVotes}
                        disabled={isDisabled}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                        <MousePointerClick className="w-5 h-5" />
                        {mySelectedSlotsCount > 0
                            ? `Confirm ${mySelectedSlotsCount} Times`
                            : isVotingEnabled
                                ? 'Select Time'
                                : 'Enter Name to Vote'}
                    </button>
                </div>
            </div>
        </div>
    );
}