// components/poll/PollFooter.tsx
import React from 'react';
import { MousePointerClick } from 'lucide-react';
import type { IPoll } from '@/types/Poll';

interface PollFooterProps {
    voteCount: number;
    pollStatus: IPoll['status'];
    mySelectedSlotsCount: number;
    // Səs göndərmə funksiyası burada olmalı (hazırda vizualdır)
    // onSendVotes: () => void;
}

export default function PollFooter({ voteCount, pollStatus, mySelectedSlotsCount }: PollFooterProps) {
    const isPollOpen = pollStatus === 'open';
    const isDisabled = mySelectedSlotsCount === 0 || !isPollOpen;

    return (
        <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Sol tərəf: Statistika */}
                <div className="flex gap-8 text-center md:text-left">
                    <div>
                        <div className="text-2xl font-bold text-gray-900">{voteCount}</div>
                        <div className="text-gray-500 text-xs uppercase tracking-wide">İştirakçı</div>
                    </div>
                    <div>
                        <div className={`text-2xl font-bold ${isPollOpen ? 'text-green-600' : 'text-red-600'}`}>
                            {isPollOpen ? 'Açıq' : 'Bağlı'}
                        </div>
                        <div className="text-gray-500 text-xs uppercase tracking-wide">Status</div>
                    </div>
                </div>

                {/* Sağ tərəf: Səs Göndər Düyməsi (Vizual) */}
                <div className="w-full md:w-auto">
                    <button
                        disabled={isDisabled}
                        // onClick={onSendVotes} // Məntiq bu komponentdə tam deyil
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                        <MousePointerClick className="w-5 h-5" />
                        {mySelectedSlotsCount > 0 ? `${mySelectedSlotsCount} Vaxt Təsdiqlə` : 'Vaxt seçin'}
                    </button>
                </div>
            </div>
        </div>
    );
}