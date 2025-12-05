// components/poll/PollScheduleGrid.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CalendarCheck } from 'lucide-react'; // Added CalendarCheck for better icon

// NOTE: TimeSlot is imported but its internal implementation is assumed to handle the click and style correctly.
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
    // This function returns the Tailwind CSS class string for styling
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
            <div className="text-center py-20 bg-white rounded-2xl shadow-xl border border-dashed border-gray-300">
                <p className="text-gray-500 font-medium text-lg">No time slots are available to display.</p>
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
                // Enhanced container design
                className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-100"
            >
                {/* Enhanced Header Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 border-b pb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center mb-2 sm:mb-0">
                        <CalendarCheck className="w-6 h-6 mr-3 text-indigo-600" />
                        Availability for: <span className="ml-1 text-indigo-700">{currentDayGroup.date}</span>
                    </h2>

                    {mySelectedSlots.length > 0 && (
                        <span className="text-sm font-semibold text-white bg-indigo-600 px-4 py-2 rounded-full shadow-md flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            {mySelectedSlots.length} Slots Selected
                        </span>
                    )}
                </div>

                {/* Slot Grid (Same structure as original) */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                    {currentDayGroup.slots.map((slot) => (
                        <TimeSlot
                            key={slot.fullIso}
                            slot={slot}
                            // Original logic retained
                            style={getSlotStyle(slot.count, slot.fullIso)}
                            isSelected={mySelectedSlots.includes(slot.fullIso)}
                            onClick={handleSlotClick}
                        />
                    ))}
                </div>

                {/* Footer / Hint Section (New addition for better context) */}
                <div className="mt-6 pt-4 border-t text-xs text-gray-500 text-center">
                    Click on a slot to toggle your availability. Style reflects voter consensus.
                </div>
            </motion.div>
        </AnimatePresence>
    );
}