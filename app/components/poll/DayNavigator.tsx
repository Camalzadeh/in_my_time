// components/poll/DayNavigator.tsx
import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface ScheduleDayGroup {
    date: string;
    fullDate: string;
    slots: any[]; // Tam tipi əlavə edilə bilər
}

interface DayNavigatorProps {
    scheduleData: ScheduleDayGroup[];
    currentDayIndex: number;
    handlePrevDay: () => void;
    handleNextDay: () => void;
    handleDaySelect: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function DayNavigator({
                                         scheduleData,
                                         currentDayIndex,
                                         handlePrevDay,
                                         handleNextDay,
                                         handleDaySelect
                                     }: DayNavigatorProps) {
    if (scheduleData.length === 0) return null;

    return (
        <div className="flex items-center justify-between bg-white p-2 rounded-xl shadow-sm border border-gray-200 mb-6 sticky top-4 z-30">
            <button
                onClick={handlePrevDay}
                disabled={currentDayIndex === 0}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>

            <div className="relative group">
                <select
                    value={currentDayIndex}
                    onChange={handleDaySelect}
                    className="appearance-none bg-transparent font-bold text-lg text-center text-gray-800 py-2 pl-4 pr-8 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:bg-gray-50 transition-colors capitalize"
                >
                    {scheduleData.map((day, idx) => (
                        <option
                            key={day.fullDate}
                            value={idx}
                            suppressHydrationWarning={true}
                        >
                            {day.date}
                        </option>
                    ))}
                </select>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none pr-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                </div>
            </div>

            <button
                onClick={handleNextDay}
                disabled={currentDayIndex === scheduleData.length - 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
        </div>
    );
}