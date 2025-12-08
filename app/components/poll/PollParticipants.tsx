import React from 'react';
import { motion } from 'framer-motion';
import { Users, Trash2, CalendarDays, ShieldCheck } from 'lucide-react';
import { IVote } from '@/types/Poll';

interface PollParticipantsProps {
    votes: IVote[];
    currentVoterId: string;
    isOwner: boolean;
    onClearVote: (voterId: string, voterName: string) => void;
}

export default function PollParticipants({ votes, currentVoterId, isOwner, onClearVote }: PollParticipantsProps) {
    if (votes.length === 0) return null;

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    return (
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-fit sticky top-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-lg font-bold text-gray-900">Participants</h3>
                </div>
                <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                    {votes.length}
                </span>
            </div>

            <div className="flex flex-col gap-2">
                {votes.map((vote, idx) => {
                    const slotCount = vote.selectedSlots ? vote.selectedSlots.length : 0;
                    const isMe = vote.voterId === currentVoterId;
                    const showDelete = isOwner && !isMe && slotCount > 0;

                    return (
                        <motion.div
                            key={vote.voterId}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className={`
                                group relative flex items-center justify-between p-3 rounded-xl border transition-all duration-200
                                ${isMe
                                ? 'bg-indigo-50/60 border-indigo-100'
                                : 'bg-white border-transparent hover:border-gray-100 hover:bg-gray-50'
                            }
                            `}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={`
                                    relative w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                                    ${isMe
                                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                                    : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600'
                                }
                                `}>
                                    {getInitials(vote.voterName)}
                                    {isMe && (
                                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-[1px]">
                                            <ShieldCheck className="w-3 h-3 text-indigo-600" />
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0 flex flex-col">
                                    <div className="flex items-center gap-1.5">
                                        <span className={`text-sm font-semibold truncate ${isMe ? 'text-indigo-900' : 'text-gray-900'}`}>
                                            {vote.voterName}
                                        </span>
                                        {isMe && <span className="text-[9px] font-bold text-indigo-500 bg-indigo-100 px-1.5 rounded-full">YOU</span>}
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                        <CalendarDays className="w-3 h-3" />
                                        <span>{new Date(vote.votedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pl-2">
                                <div className={`
                                    text-xs font-bold px-2.5 py-1 rounded-lg
                                    ${isMe ? 'bg-white text-indigo-600 border border-indigo-100' : 'bg-gray-100 text-gray-600'}
                                `}>
                                    {slotCount} <span className="font-normal opacity-70 ml-0.5">slots</span>
                                </div>

                                {showDelete && (
                                    <button
                                        onClick={() => onClearVote(vote.voterId, vote.voterName)}
                                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        title="Remove vote"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    );
}