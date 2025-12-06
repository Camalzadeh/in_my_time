// components/poll/TimeSlot.tsx

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    const [isHovered, setIsHovered] = useState(false);
    const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Hover zamanı koordinatları hesablayırıq
    const handleMouseEnter = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setTooltipPos({
                top: rect.top, // Düymənin təpə nöqtəsi
                left: rect.left + rect.width / 2 // Düymənin mərkəzi
            });
            setIsHovered(true);
        }
    };

    return (
        <>
            <motion.button
                ref={buttonRef}
                layout
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onClick(slot.fullIso)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setIsHovered(false)}
                className={`
                    relative group flex flex-col items-center justify-center 
                    w-full h-20 sm:h-24 rounded-2xl border-2 transition-colors duration-300
                    outline-none focus:ring-4 focus:ring-indigo-100 z-0 hover:z-10
                    ${style}
                `}
            >
                {/* Time Display */}
                <span className="text-sm sm:text-base font-bold tracking-tight z-10">
                    {slot.time}
                </span>

                {/* Vote Count Badge */}
                {slot.count > 0 && (
                    <div className={`
                        mt-1.5 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold z-10
                        ${isSelected
                        ? 'bg-white/20 text-black backdrop-blur-sm'
                        : 'bg-black/5 text-current'}
                    `}>
                        <Users className="w-3 h-3" />
                        <span>{slot.count}</span>
                    </div>
                )}

                {/* Selected Checkmark Animation */}
                <AnimatePresence>
                    {isSelected && (
                        <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            className="absolute -top-2 -right-2 bg-indigo-600 text-white rounded-full p-1.5 shadow-lg border-2 border-white z-20"
                        >
                            <Check className="w-3 h-3 stroke-[3]" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* PORTAL TOOLTIP:
                Bu hissə birbaşa 'body' elementinə render olunur.
                Buna görə də heç bir parent element (overflow:hidden olsa belə)
                bunun üstünü örtə bilməz.
            */}
            <PortalTooltip
                isOpen={isHovered && slot.count > 0}
                top={tooltipPos.top}
                left={tooltipPos.left}
            >
                <div className="bg-gray-900/95 backdrop-blur-md text-white text-xs rounded-xl p-3 shadow-2xl border border-gray-700/50 w-max max-w-[180px]">
                    <div className="flex items-center gap-2 font-bold mb-2 border-b border-gray-700 pb-2 text-gray-300">
                        <Users className="w-3 h-3" />
                        <span>Voters ({slot.count})</span>
                    </div>
                    <div className="flex flex-col gap-1 max-h-[120px] overflow-y-auto custom-scrollbar">
                        {slot.voters.map((name, i) => (
                            <div key={i} className="flex items-center gap-2 truncate text-gray-200">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0"></div>
                                <span className="truncate">{name}</span>
                            </div>
                        ))}
                    </div>
                    {/* Arrow Pointer */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-gray-900/95"></div>
                </div>
            </PortalTooltip>
        </>
    );
}

// --- Internal Helper Component for Portal ---
const PortalTooltip = ({ isOpen, top, left, children }: { isOpen: boolean; top: number; left: number; children: React.ReactNode }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: -12, scale: 1 }} // Y: -12 düymənin bir az yuxarısına qaldırır
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    style={{
                        position: 'fixed',
                        top: top,
                        left: left,
                        transform: 'translate(-50%, -100%)', // Mərkəzləşdirir və yuxarı çəkir
                        zIndex: 9999, // Hər şeyin üstündə olması üçün
                        pointerEvents: 'none'
                    }}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};