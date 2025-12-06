// components/poll/PollLeaderboard.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, CalendarDays, Users, Star } from 'lucide-react';

interface LeaderboardSlot {
    time: string;
    date: string;
    count: number;
    iso: string;
}

interface PollLeaderboardProps {
    leaderboard: LeaderboardSlot[];
    maxVoteCount: number;
}

export default function PollLeaderboard({ leaderboard, maxVoteCount }: PollLeaderboardProps) {
    if (leaderboard.length === 0) return null;

    const getRankConfig = (index: number) => {
        switch (index) {
            case 0:
                return {
                    icon: <Trophy className="w-5 h-5" />,
                    bg: "bg-gradient-to-r from-amber-50 to-orange-50",
                    border: "border-amber-200",
                    text: "text-amber-900",
                    badge: "bg-amber-100 text-amber-700",
                    bar: "bg-amber-500"
                };
            case 1:
                return {
                    icon: <Medal className="w-5 h-5" />,
                    bg: "bg-gradient-to-r from-slate-50 to-gray-50",
                    border: "border-slate-200",
                    text: "text-slate-900",
                    badge: "bg-slate-100 text-slate-700",
                    bar: "bg-slate-500"
                };
            case 2:
                return {
                    icon: <Medal className="w-5 h-5" />,
                    bg: "bg-gradient-to-r from-orange-50 to-red-50",
                    border: "border-orange-200",
                    text: "text-orange-900",
                    badge: "bg-orange-100 text-orange-700",
                    bar: "bg-orange-500"
                };
            default:
                return {
                    icon: <span className="text-sm font-bold">#{index + 1}</span>,
                    bg: "bg-white",
                    border: "border-gray-100",
                    text: "text-gray-900",
                    badge: "bg-indigo-50 text-indigo-600",
                    bar: "bg-indigo-500"
                };
        }
    };

    return (
        <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
                <div className="p-2 bg-yellow-50 rounded-xl text-yellow-600">
                    <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Top Choices</h3>
                    <p className="text-xs text-gray-500 font-medium">Participants&apos; favorite times</p>
                </div>
            </div>

            {/* List View */}
            <div className="flex flex-col gap-3">
                {leaderboard.map((slot, index) => {
                    const config = getRankConfig(index);
                    const percentage = Math.round((slot.count / maxVoteCount) * 100);

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`
                                relative group overflow-hidden rounded-2xl border p-4 transition-all hover:shadow-md
                                ${config.border} ${config.bg}
                            `}
                        >
                            <div className="relative z-10 flex items-center justify-between gap-4">
                                {/* Left: Rank & Time */}
                                <div className="flex items-center gap-4">
                                    <div className={`
                                        w-10 h-10 flex items-center justify-center rounded-xl shadow-sm border border-white/50
                                        ${config.badge}
                                    `}>
                                        {config.icon}
                                    </div>

                                    <div>
                                        <div className={`text-lg font-bold ${config.text}`}>
                                            {slot.time}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 opacity-80">
                                            <CalendarDays className="w-3 h-3" />
                                            {slot.date}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Stats */}
                                <div className="text-right">
                                    <div className="flex items-center justify-end gap-1.5 text-sm font-bold text-gray-900">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        {slot.count}
                                    </div>
                                    <div className="text-[10px] font-semibold text-gray-400 mt-0.5">
                                        {percentage}% Support
                                    </div>
                                </div>
                            </div>

                            {/* Progress Line (Bottom) */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                    className={`h-full ${config.bar}`}
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}