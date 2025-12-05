// components/poll/PollHeader.tsx
'use client';

import React, { useState } from 'react';
import { Clock, Users, Copy, Check } from 'lucide-react';
import type { IPoll } from '@/types/Poll';

interface PollHeaderProps {
    poll: IPoll;
    isOwner: boolean;
    voterName: string | null;
}

export default function PollHeader({ poll, isOwner, voterName }: PollHeaderProps) {
    console.log("PollHeader", poll, isOwner, voterName); // TODO: Remove
    const [copyStatus, setCopyStatus] = useState<'copy' | 'copied'>('copy');

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
        setTimeout(() => setCopyStatus('copy'), 2000);
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2 text-gray-800">{poll.title}</h1>
                    <p className="text-gray-500 flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4" /> {poll.config.slotDuration} min slots
                        <span className="mx-2 text-gray-300">|</span>
                        <Users className="w-4 h-4" /> {poll.votes.length} participants
                    </p>
                </div>

                <button
                    onClick={handleCopyLink}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all text-sm
                        ${copyStatus === 'copied'
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg'}`}
                >
                    {copyStatus === 'copied' ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
                    {copyStatus === 'copied' ? 'Copied' : 'Share Link'}
                </button>
            </div>
        </div>
    );
}