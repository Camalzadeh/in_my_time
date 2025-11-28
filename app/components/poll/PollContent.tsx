'use client';

import React, { useState, useMemo } from 'react';
import { configureAbly, useChannel } from '@ably-labs/react-hooks';
import Ably from "ably";
import {
    Calendar,
    Clock,
    Users,
    Check,
    Copy,
    ChevronLeft,
    ChevronRight,
    MousePointerClick
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Sizin mövcud tiplərinizi import edirik
// DİQQƏT: 'mongoose' kitabxanasını client-side bundle-a salmamaq üçün 'import type' istifadə edirik
import type { IPoll } from '@/types/Poll';

interface PollRealtimeUpdatesProps {
    pollId: string;
    initialPollData: IPoll;
}

// Ably Konfiqurasiyası
configureAbly({ authUrl: '/api/ably' });

// --- KÖMƏKÇİ FUNKSİYALAR ---

// Saatı (məs: "09:30") dəqiqəyə çevirir
const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

// Gün və saat aralığına görə slotları yaradır
// dateInput həm Date object, həm də string gələ bilər (JSON serialize səbəbilə)
const generateSlots = (dateInput: string | Date, start: string, end: string, duration: number) => {
    const slots: string[] = [];
    const startMins = timeToMinutes(start);
    const endMins = timeToMinutes(end);

    // Tarixi düzgün parse etmək üçün
    const baseDate = new Date(dateInput);

    for (let time = startMins; time < endMins; time += duration) {
        const h = Math.floor(time / 60);
        const m = time % 60;

        // Slotun konkret vaxtını yaradırıq
        const slotDate = new Date(baseDate);
        slotDate.setHours(h, m, 0, 0);

        slots.push(slotDate.toISOString());
    }
    return slots;
};

export default function PollRealtimeUpdates({ pollId, initialPollData }: PollRealtimeUpdatesProps) {
    const [poll, setPoll] = useState<IPoll>(initialPollData);
    const [copyStatus, setCopyStatus] = useState<'copy' | 'copied'>('copy');

    // YENİ: Cari günün indeksi (Naviqasiya üçün)
    const [currentDayIndex, setCurrentDayIndex] = useState(0);

    // YENİ: İstifadəçinin seçdiyi slotlar (Müvəqqəti local state)
    const [mySelectedSlots, setMySelectedSlots] = useState<string[]>([]);

    // 1. Ably Realtime Dinləmə
    const channelName = `poll-${pollId}-updates`;
    const [channel] = useChannel(channelName, (message: Ably.Message) => {
        const newPollData = message.data as IPoll;
        console.log("🔥 Canlı Yenilənmə:", newPollData);
        setPoll(newPollData);
    });

    // 2. Link Kopyalama
    const handleCopyLink = () => {
        const pollUrl = window.location.href;
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(pollUrl);
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = pollUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('copy'), 2000);
    };

    // 3. Cədvəl Məlumatlarının Hesablanması (Heavy Logic)
    const scheduleData = useMemo(() => {
        const groups: { date: string; fullDate: string; slots: { time: string; fullIso: string; count: number; voters: string[] }[] }[] = [];

        poll.config.targetDates.forEach((dateInput) => {
            const rawSlots = generateSlots(
                dateInput,
                poll.config.dailyStartTime,
                poll.config.dailyEndTime,
                poll.config.slotDuration
            );

            const processedSlots = rawSlots.map(slotIso => {
                const votersForSlot = poll.votes.filter(v =>
                    (v.selectedSlots as unknown as string[]).includes(slotIso)
                );

                return {
                    fullIso: slotIso,
                    time: new Date(slotIso).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' }),
                    count: votersForSlot.length,
                    voters: votersForSlot.map(v => v.voterName)
                };
            });

            groups.push({
                date: new Date(dateInput).toLocaleDateString('az-AZ', { weekday: 'long', day: 'numeric', month: 'long' }),
                fullDate: new Date(dateInput).toISOString(), // Dropdown value üçün unikal açar
                slots: processedSlots
            });
        });

        return groups;
    }, [poll]);

    // Maksimum səs sayını tapırıq (Rəngləndirmə üçün)
    const maxVoteCount = Math.max(
        ...scheduleData.flatMap(d => d.slots.map(s => s.count)),
        1
    );

    // Slot rəngini təyin edən funksiya
    // İndi həm "Heatmap" (başqalarının səsi), həm də "Mənim seçimim" (klikləmə) nəzərə alınır
    const getSlotStyle = (count: number, iso: string) => {
        const isSelected = mySelectedSlots.includes(iso);

        // Əgər mən seçmişəmsə (Ən yüksək prioritet)
        if (isSelected) {
            return "bg-indigo-600 border-indigo-700 text-white shadow-lg ring-2 ring-indigo-300 ring-offset-1 transform scale-105 z-10";
        }

        // Əgər heç səs yoxdursa
        if (count === 0) return "bg-gray-50 border-gray-200 text-gray-400 hover:border-indigo-300 hover:bg-gray-100";

        // Heatmap rəngləri (Başqaları səs veribsə)
        const intensity = count / maxVoteCount;
        if (intensity < 0.3) return "bg-green-100 border-green-200 text-green-700 hover:border-green-300";
        if (intensity < 0.7) return "bg-green-300 border-green-400 text-green-900 hover:border-green-500";
        return "bg-green-500 border-green-600 text-white shadow-sm";
    };

    // Slot klikləmə funksiyası
    const handleSlotClick = (iso: string) => {
        setMySelectedSlots(prev => {
            if (prev.includes(iso)) {
                return prev.filter(item => item !== iso); // Seçimi ləğv et
            } else {
                return [...prev, iso]; // Seçim əlavə et
            }
        });
    };

    // Günləri dəyişmək üçün funksiyalar
    const handlePrevDay = () => setCurrentDayIndex(prev => Math.max(0, prev - 1));
    const handleNextDay = () => setCurrentDayIndex(prev => Math.min(scheduleData.length - 1, prev + 1));
    const handleDaySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCurrentDayIndex(Number(e.target.value));
    };

    // Hazırda göstərilən gün
    const currentDayGroup = scheduleData[currentDayIndex];

    return (
        <main className="min-h-screen bg-gray-50 text-gray-900 py-10 px-4">
            <div className="max-w-5xl mx-auto">

                {/* Header Hissəsi */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 text-gray-800">{poll.title}</h1>
                            <p className="text-gray-500 flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4" /> {poll.config.slotDuration} dəqiqəlik slotlar
                                <span className="mx-2 text-gray-300">|</span>
                                <Users className="w-4 h-4" /> {poll.votes.length} iştirakçı
                            </p>
                        </div>

                        <button
                            onClick={handleCopyLink}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all text-sm
                                ${copyStatus === 'copied'
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg'}`}
                        >
                            {copyStatus === 'copied' ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
                            {copyStatus === 'copied' ? 'Kopyalandı' : 'Paylaş'}
                        </button>
                    </div>
                </div>

                {/* NAVİQASİYA VƏ GÜN SEÇİMİ */}
                {scheduleData.length > 0 && (
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
                                    // HYDRATION FIX: Dropdown menyusunda tarixlərin server/client fərqi
                                    <option
                                        key={day.fullDate}
                                        value={idx}
                                        suppressHydrationWarning={true}
                                    >
                                        {day.date}
                                    </option>
                                ))}
                            </select>
                            {/* Custom dropdown arrow */}
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
                )}

                {/* Səsvermə Cədvəli (Tək Günlük) */}
                <div className="min-h-[400px]">
                    {scheduleData.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                            <p className="text-gray-500">Göstəriləcək vaxt slotu yoxdur.</p>
                        </div>
                    ) : (
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
                                        <div
                                            key={slot.fullIso}
                                            onClick={() => handleSlotClick(slot.fullIso)}
                                            className={`
                                                relative group flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none
                                                ${getSlotStyle(slot.count, slot.fullIso)}
                                            `}
                                        >
                                            {/* Slot Time - HYDRATION FIX */}
                                            <span
                                                className="text-sm font-medium"
                                                suppressHydrationWarning={true}
                                            >
                                                {slot.time}
                                            </span>

                                            {/* Səs sayı göstəricisi (əgər seçilməyibsə göstər) */}
                                            {slot.count > 0 && !mySelectedSlots.includes(slot.fullIso) && (
                                                <div className="mt-1 flex items-center gap-1 text-xs opacity-90">
                                                    <Users className="w-3 h-3" /> {slot.count}
                                                </div>
                                            )}

                                            {/* Seçilib işarəsi */}
                                            {mySelectedSlots.includes(slot.fullIso) && (
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
                                    ))}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>

                {/* Footer Statistikası və Təsdiq */}
                <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        {/* Sol tərəf: Statistika */}
                        <div className="flex gap-8 text-center md:text-left">
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{poll.votes.length}</div>
                                <div className="text-gray-500 text-xs uppercase tracking-wide">İştirakçı</div>
                            </div>
                            <div>
                                <div className={`text-2xl font-bold ${poll.status === 'open' ? 'text-green-600' : 'text-red-600'}`}>
                                    {poll.status === 'open' ? 'Açıq' : 'Bağlı'}
                                </div>
                                <div className="text-gray-500 text-xs uppercase tracking-wide">Status</div>
                            </div>
                        </div>

                        {/* Sağ tərəf: Səs Göndər Düyməsi (Vizual) */}
                        <div className="w-full md:w-auto">
                            <button
                                disabled={mySelectedSlots.length === 0 || poll.status !== 'open'}
                                className="w-full md:w-auto flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                            >
                                <MousePointerClick className="w-5 h-5" />
                                {mySelectedSlots.length > 0 ? `${mySelectedSlots.length} Vaxt Təsdiqlə` : 'Vaxt seçin'}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}