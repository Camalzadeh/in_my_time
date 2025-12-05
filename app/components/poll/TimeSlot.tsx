// components/poll/TimeSlot.tsx
import React from 'react';
import { Users, Check } from 'lucide-react';

interface SlotData {
    fullIso: string;
    time: string;
    count: number;
    voters: string[];
}

interface TimeSlotProps {
    slot: SlotData;
    style: string;
    isSelected: boolean;
    onClick: (iso: string) => void;
}

export default function TimeSlot({ slot, style, isSelected, onClick }: TimeSlotProps) {
    return (
        <div
            key={slot.fullIso}
            onClick={() => onClick(slot.fullIso)}
            className={`
                relative group flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none
                ${style}
            `}
        >
            {/* Slot Time - HYDRATION FIX */}
            <span
                className="text-sm font-medium"
                suppressHydrationWarning={true}
            >
                {slot.time}
            </span>

            {/* Səs sayı göstəricisi */}
            {slot.count > 0 && !isSelected && (
                <div className="mt-1 flex items-center gap-1 text-xs opacity-90">
                    <Users className="w-3 h-3" /> {slot.count}
                </div>
            )}

            {/* Seçilib işarəsi */}
            {isSelected && (
                <div className="absolute -top-2 -right-2 bg-indigo-600 text-white rounded-full p-1 shadow-md">
                    <Check className="w-3 h-3" />
                </div>
            )}

            {/* Tooltip: Səs verənlər */}
            {slot.count > 0 && (
                <div className="absolute bottom-full mb-3 hidden group-hover:block w-max max-w-[150px] bg-gray-900/95 backdrop-blur text-white text-xs rounded-lg p-3 shadow-xl z-20 text-center pointer-events-none">
                    <div className="font-bold mb-1 border-b border-gray-700 pb-1 text-gray-300">Səs verənlər:</div>
                    {slot.voters.map((name, i) => (
                        <div key={i} className="truncate py-0.5">{name}</div>
                    ))}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900/95"></div>
                </div>
            )}
        </div>
    );
}