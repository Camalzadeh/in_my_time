'use client';

import React, { useState } from 'react';
import {
    Clock,
    Users,
    Check,
    Crown,
    CalendarRange,
    Link as LinkIcon,
    Pencil
} from 'lucide-react';
import type { IPoll } from '@/types/Poll';

interface PollHeaderProps {
    poll: IPoll;
    isOwner: boolean;
    voterName: string | null;
    onEditName: () => void;
}

export default function PollHeader({ poll, isOwner, voterName, onEditName }: PollHeaderProps) {
    const [copyStatus, setCopyStatus] = useState('idle');

    const handleCopyLink = () => {
        const pollUrl = window.location.href;
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(pollUrl);
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = pollUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 2000);
    };

    const isOpen = poll.status === 'open';

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${isOpen ? 'text-emerald-600' : 'text-red-600'}`}>
                            <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            {isOpen ? 'Open' : 'Closed'}
                        </div>

                        {isOwner && (
                            <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-100 flex items-center gap-1">
                                <Crown className="w-3 h-3" /> Owner
                            </span>
                        )}
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2 truncate">
                        {poll.title}
                    </h1>

                    {poll.description && (
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                            {poll.description}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 font-medium">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{poll.config.slotDuration}m slots</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span>{poll.votes.length} participants</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CalendarRange className="w-4 h-4 text-gray-400" />
                            <span>{poll.config.targetDates.length} days</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 w-full md:w-auto mt-2 md:mt-0">
                    <button
                        onClick={handleCopyLink}
                        className={`
                            h-10 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all border w-full md:w-auto
                            ${copyStatus === 'copied'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }
                        `}
                    >
                        {copyStatus === 'copied' ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                        {copyStatus === 'copied' ? 'Copied' : 'Share'}
                    </button>

                    {voterName && (
                        <div className="flex flex-col items-end border-l border-gray-100 pl-4 ml-1">
                            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Voting as</div>
                            <button
                                onClick={onEditName}
                                className="group flex items-center gap-1.5 hover:bg-gray-50 px-2 py-1 -mr-2 rounded-lg transition-colors"
                            >
                                <span className="text-sm font-bold text-gray-900 truncate max-w-[120px]">{voterName}</span>
                                <Pencil className="w-3 h-3 text-gray-400 group-hover:text-indigo-500" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}