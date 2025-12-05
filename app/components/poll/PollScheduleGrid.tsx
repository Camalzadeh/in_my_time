// components/poll/PollScheduleGrid.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TimeSlot from './TimeSlot';

interface SlotData {
    fullIso: string;
    time: string;
    count: number;
    voters: string[];
}

interface ScheduleDayGroup {
    date: string;
    fullDate: string;
    slots: SlotData[];
}

interface PollScheduleGridProps {
    currentDayGroup: ScheduleDayGroup;
    currentDayIndex: number;
    mySelectedSlots: string[];
    getSlotStyle: (count: number, iso: string) => string;
    handleSlotClick: (iso: string) => void;
}

export default function PollScheduleGrid({
                                             currentDayGroup,
                                             currentDayIndex,
                                             mySelectedSlots,
                                             getSlotStyle,
                                             handleSlotClick
                                         }: PollScheduleGridProps) {
    if (!currentDayGroup) {
        return (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-500">Göstəriləcək vaxt slotu yoxdur.</p>
            </div>
        );
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={currentDayIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wider">
                        Vaxt seçimi
                    </h2>
                    {mySelectedSlots.length > 0 && (
                        <span className="text-indigo-600 text-sm font-semibold bg-indigo-50 px-3 py-1 rounded-full">
                            {mySelectedSlots.length} slot seçilib
                        </span>
                    )}
                </div>

                {/* Slotlar Grid-i */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {currentDayGroup.slots.map((slot) => (
                        <TimeSlot
                            key={slot.fullIso}
                            slot={slot}
                            style={getSlotStyle(slot.count, slot.fullIso)}
                            isSelected={mySelectedSlots.includes(slot.fullIso)}
                            onClick={handleSlotClick}
                        />
                    ))}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}