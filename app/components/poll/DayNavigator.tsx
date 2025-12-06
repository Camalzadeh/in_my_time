import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    Calendar,
    ChevronDown,
    Users
} from 'lucide-react';

interface SlotData {
    count: number;
    // Digər sahələr bu komponent üçün vacib deyil
}

interface ScheduleDayGroup {
    date: string;       // Məs: "Monday, Oct 24"
    fullDate: string;   // ISO String
    slots: SlotData[];
}

interface DayNavigatorProps {
    scheduleData: ScheduleDayGroup[];
    currentDayIndex: number;
    handlePrevDay: () => void;
    handleNextDay: () => void;
    handleDaySelect: (e: React.ChangeEvent<HTMLSelectElement>) => void; // Bu propu saxlayırıq, amma aşağıda custom handler işlədəcəyik
    // Alternativ birbaşa index dəyişən prop:
    onSelectIndex?: (index: number) => void;
}

export default function DayNavigator({
                                         scheduleData,
                                         currentDayIndex,
                                         handlePrevDay,
                                         handleNextDay,
                                         handleDaySelect,
                                         onSelectIndex
                                     }: DayNavigatorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Dropdown-dan kənara klikləyəndə bağlamaq üçün
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (scheduleData.length === 0) return null;

    const currentDay = scheduleData[currentDayIndex];

    // Helper: Bir gündəki ümumi səsləri hesablamaq
    const getDayTotalVotes = (day: ScheduleDayGroup) => {
        return day.slots.reduce((acc, slot) => acc + slot.count, 0);
    };

    // Custom select handler
    const handleCustomSelect = (index: number) => {
        if (onSelectIndex) {
            onSelectIndex(index);
        } else {
            // React.ChangeEvent simulyasiyası (əgər parent component köhnə məntiqlə işləyirsə)
            const event = {
                target: { value: String(index) }
            } as React.ChangeEvent<HTMLSelectElement>;
            handleDaySelect(event);
        }
        setIsOpen(false);
    };

    return (
        <div className="flex items-center justify-between gap-3 mb-6 relative z-30" ref={dropdownRef}>

            {/* PREV BUTTON */}
            <button
                onClick={handlePrevDay}
                disabled={currentDayIndex === 0}
                className="p-3 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            {/* CUSTOM DROPDOWN TRIGGER */}
            <div className="relative flex-1 max-w-sm">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between bg-white border border-gray-200 px-4 py-3 rounded-xl shadow-sm hover:border-indigo-300 hover:ring-2 hover:ring-indigo-100 transition-all group"
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="bg-indigo-50 p-1.5 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col items-start truncate">
                            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Selected Date</span>
                            <span className="text-sm font-bold text-gray-900 truncate">{currentDay.date}</span>
                        </div>
                    </div>

                    <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`}
                    />
                </button>

                {/* DROPDOWN MENU */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 max-h-[300px] overflow-y-auto"
                        >
                            <div className="p-1">
                                {scheduleData.map((day, idx) => {
                                    const isSelected = currentDayIndex === idx;
                                    const voteCount = getDayTotalVotes(day);

                                    return (
                                        <button
                                            key={day.fullDate}
                                            onClick={() => handleCustomSelect(idx)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl text-sm transition-all mb-1 last:mb-0 ${
                                                isSelected
                                                    ? 'bg-indigo-50 text-indigo-900 font-semibold'
                                                    : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-indigo-500' : 'bg-gray-300'}`} />
                                                <span>{day.date}</span>
                                            </div>

                                            {/* Vote Count Badge */}
                                            {voteCount > 0 && (
                                                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${
                                                    isSelected
                                                        ? 'bg-indigo-100 text-indigo-700'
                                                        : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                    <Users className="w-3 h-3" />
                                                    {voteCount}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* NEXT BUTTON */}
            <button
                onClick={handleNextDay}
                disabled={currentDayIndex === scheduleData.length - 1}
                className="p-3 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
}