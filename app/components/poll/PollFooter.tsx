import React from 'react';
import { MousePointerClick, Ban, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import type { IPoll } from '@/types/Poll';

interface PollFooterProps {
    voteCount: number;
    pollStatus: IPoll['status'];
    mySelectedSlotsCount: number;
    onSendVotes: () => Promise<void>;

    isOwner: boolean;
    hasVoterName: boolean;
    hasUnsavedChanges: boolean;
    onFinalizePoll?: () => void;
}

export default function PollFooter({
                                       voteCount,
                                       pollStatus,
                                       mySelectedSlotsCount,
                                       onSendVotes,
                                       isOwner,
                                       hasVoterName,
                                       hasUnsavedChanges,
                                       onFinalizePoll
                                   }: PollFooterProps) {
    const isPollOpen = pollStatus === 'open';

    let buttonText = 'Select Time';
    let buttonIcon = <MousePointerClick className="w-5 h-5" />;


    const isSubmitDisabled = !isPollOpen || !hasVoterName || !hasUnsavedChanges;

    if (!isPollOpen) {
        buttonText = 'Poll Finalized';
        buttonIcon = <CheckCircle2 className="w-5 h-5" />;
    } else if (!hasVoterName) {
        buttonText = 'Enter Name to Vote';
    } else if (mySelectedSlotsCount > 0) {
        buttonText = `Confirm ${mySelectedSlotsCount} Times`;
    } else if (hasUnsavedChanges && mySelectedSlotsCount === 0) {
        buttonText = 'Confirm Removal';
        buttonIcon = <Trash2 className="w-5 h-5" />;
    }

    const statusConfig = isPollOpen
        ? { text: 'Voting Active', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' }
        : { text: 'Voting Closed', color: 'text-gray-500', bg: 'bg-gray-100 border-gray-200' };

    return (
        <div className="mt-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-indigo-100/50 border border-gray-100 relative overflow-hidden">

                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                <div className="flex flex-col lg:flex-row items-center justify-between gap-8">

                    <div className="flex items-center gap-8 w-full lg:w-auto justify-center lg:justify-start">
                        <div className="text-center lg:text-left">
                            <div className="text-3xl font-extrabold text-gray-900 leading-none mb-1">{voteCount}</div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Participants</div>
                        </div>

                        <div className="h-10 w-px bg-gray-200 hidden sm:block" />

                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${statusConfig.bg}`}>
                            <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${isPollOpen ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                            <div>
                                <div className={`text-sm font-bold ${statusConfig.color}`}>{statusConfig.text}</div>
                                {isPollOpen && <div className="text-[10px] text-gray-500 font-medium leading-none">Real-time updates</div>}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">

                        {isOwner && isPollOpen && (
                            <button
                                onClick={onFinalizePoll}
                                className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 hover:border-red-200 transition-all flex items-center justify-center gap-2 group"
                            >
                                <Ban className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                Finalize Poll
                            </button>
                        )}

                        <button
                            onClick={onSendVotes}
                            disabled={isSubmitDisabled}
                            className={`
                                relative w-full sm:w-auto min-w-[200px] px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2.5 transition-all duration-200
                                ${isSubmitDisabled
                                ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none'
                                : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
                            }
                            `}
                        >
                            {buttonIcon}
                            <span>{buttonText}</span>
                            {!isSubmitDisabled && <ArrowRight className="w-4 h-4 opacity-50" />}
                        </button>
                    </div>
                </div>
            </div>

            {!hasVoterName && isPollOpen && (
                <div className="mt-3 text-center animate-in fade-in slide-in-from-top-2">
                    <p className="text-sm text-gray-500 flex items-center justify-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-indigo-500" />
                        Please enter your name above to start selecting times.
                    </p>
                </div>
            )}
        </div>
    );
}

import { Trash2 } from 'lucide-react';