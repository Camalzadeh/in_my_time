import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Clock, Calendar, AlertCircle, Info } from 'lucide-react';

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

    const containerVariants: Variants = {
        hidden: { opacity: 0, y: 10, scale: 0.98 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.3, ease: "easeOut" }
        },
        exit: {
            opacity: 0,
            y: -10,
            scale: 0.98,
            transition: { duration: 0.2 }
        }
    };

    if (!currentDayGroup || currentDayGroup.slots.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-200 text-center"
            >
                <div className="bg-gray-50 p-4 rounded-full mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-gray-900 font-semibold text-lg">No slots available</h3>
                <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">
                    There are no time slots configured for this date. Please try selecting another day.
                </p>
            </motion.div>
        );
    }

    const dateParts = currentDayGroup.date.split(',');
    const dayName = dateParts[0];
    const fullDate = dateParts.slice(1).join(',');

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={currentDayIndex}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
            >
                <div className="px-6 py-5 sm:px-8 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex flex-col items-center justify-center bg-white border border-gray-200 rounded-2xl w-14 h-14 shadow-sm text-center">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Day</span>
                                <span className="text-xl font-bold text-gray-900 leading-none">{currentDayIndex + 1}</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                                    {dayName}
                                </h2>
                                <p className="text-gray-500 font-medium">
                                    {fullDate}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {mySelectedSlots.length > 0 ? (
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-all hover:scale-105">
                                    <Clock className="w-4 h-4" />
                                    {mySelectedSlots.length} Selected
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 text-sm font-medium rounded-xl">
                                    <AlertCircle className="w-4 h-4" />
                                    Select a time
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 sm:p-8">
                    <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
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
                </div>

                <div className="bg-gray-50/80 px-6 py-4 border-t border-gray-100 flex flex-wrap justify-center sm:justify-between items-center gap-4 text-xs text-gray-500 font-medium">
                    <div className="flex items-center gap-1">
                        <Info className="w-3.5 h-3.5" />
                        <span>Tap to toggle availability</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-white border border-gray-300"></div>
                            <span>Empty</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-200 border border-emerald-300"></div>
                            <span>Popular</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-indigo-600 border border-indigo-700"></div>
                            <span>Your Choice</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}