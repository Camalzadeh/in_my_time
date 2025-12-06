// components/poll/PollSidebarStats.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, CalendarDays, Vote, Sparkles } from 'lucide-react';

interface ScheduleDayGroup {
    date: string;
    slots: { count: number }[];
}

interface PollSidebarStatsProps {
    slotDuration: number;
    scheduleData: ScheduleDayGroup[];
}

export default function PollSidebarStats({ slotDuration, scheduleData }: PollSidebarStatsProps) {
    const totalVotes = scheduleData.flatMap(d => d.slots).reduce((acc, s) => acc + s.count, 0);

    const mostPopularDay = scheduleData.length > 0
        ? scheduleData.reduce((prev, current) => {
            const currentTotal = current.slots.reduce((a, b) => a + b.count, 0);
            const prevTotal = prev.slots ? prev.slots.reduce((a, b) => a + b.count, 0) : -1;
            return currentTotal > prevTotal ? current : prev;
        }).date
        : 'N/A';

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
        >
            {/* --- Info Card --- */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-6 text-white shadow-xl shadow-indigo-200/50">
                {/* Decorative Background Elements */}
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-purple-500/20 blur-3xl" />

                <div className="relative z-10">
                    <div className="mb-4 flex items-center gap-2 text-indigo-200">
                        <div className="rounded-lg bg-white/10 p-1.5 backdrop-blur-sm">
                            <Sparkles className="h-4 w-4 text-amber-300" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider">Poll Details</span>
                    </div>

                    <h3 className="mb-2 text-lg font-bold">How it works</h3>
                    <p className="text-sm leading-relaxed text-indigo-100/90">
                        Each time slot is <span className="font-bold text-white bg-white/20 px-1 py-0.5 rounded">{slotDuration} min</span> long.
                        Please select <strong>all</strong> the times you are available. The darker the green, the more people can make it!
                    </p>
                </div>
            </div>

            {/* --- Stats Card --- */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-2.5 border-b border-gray-100 pb-4">
                    <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                        <BarChart3 className="h-5 w-5" />
                    </div>
                    <h4 className="font-bold text-gray-900">Stats Overview</h4>
                </div>

                <div className="space-y-4">
                    {/* Total Votes Stat */}
                    <div className="flex items-center justify-between rounded-2xl border border-gray-50 bg-gray-50/50 p-4 transition-colors hover:border-gray-100 hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-100">
                                <Vote className="h-5 w-5 text-indigo-500" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase">Total Votes</p>
                                <p className="text-lg font-bold text-gray-900 leading-none">{totalVotes}</p>
                            </div>
                        </div>
                    </div>

                    {/* Popular Day Stat */}
                    <div className="flex items-center justify-between rounded-2xl border border-gray-50 bg-gray-50/50 p-4 transition-colors hover:border-gray-100 hover:bg-gray-50">
                        <div className="flex items-center gap-3 w-full">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-100">
                                <CalendarDays className="h-5 w-5 text-emerald-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase">Best Day</p>
                                <p className="text-sm font-bold text-gray-900 truncate" title={mostPopularDay}>
                                    {mostPopularDay}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}