
import React from 'react';
import { Trophy, Clock, CalendarCheck, Users, Info } from 'lucide-react';
import type { IPoll } from '@/types/Poll';
import PollParticipants from './PollParticipants';

interface FinalizedPollViewProps {
    poll: IPoll;
    isOwner: boolean;
    currentVoterId: string;
    onClearVote: (voterId: string, voterName: string) => void;
}

export default function FinalizedPollView({ poll, isOwner, currentVoterId, onClearVote }: FinalizedPollViewProps) {

    const finalDate = poll.finalTime ? new Date(poll.finalTime) : null;
    const finalTimeFormatted = finalDate ? finalDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
    const finalDateFormatted = finalDate ? finalDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'N/A';

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 space-y-8">

            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border-2 border-indigo-200 shadow-lg shadow-indigo-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500 rounded-full text-white shadow-xl shadow-amber-200">
                        <Trophy className="w-8 h-8 fill-amber-300" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <CalendarCheck className="w-5 h-5 text-indigo-600" />
                            Final Meeting Time Confirmed!
                        </h3>
                        <p className="text-gray-600 mt-1">This poll is officially closed.</p>
                    </div>
                </div>

                <div className="text-right flex flex-col items-center lg:items-end">
                    <div className="flex items-end gap-2 text-3xl font-extrabold text-indigo-600">
                        <Clock className="w-6 h-6 mb-1" />
                        {finalTimeFormatted}
                    </div>
                    <p className="text-sm font-semibold text-gray-500">
                        {finalDateFormatted}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Info className="w-4 h-4 text-indigo-500" />
                    <span>Slot Duration: <span className="font-semibold">{poll.config.slotDuration} mins</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-indigo-500" />
                    <span>Total Participants: <span className="font-semibold">{poll.votes.length}</span></span>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Participant Details</h3>
                <PollParticipants
                    votes={poll.votes}
                    currentVoterId={currentVoterId}
                    isOwner={isOwner}
                    onClearVote={onClearVote}
                />
            </div>
        </div>
    );
}