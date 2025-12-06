import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, CalendarCheck, AlertTriangle, Check,  Clock } from 'lucide-react';

interface RankedSlot {
    fullIso: string;
    time: string;
    date: string;
    count: number;
}

interface FinalizePollModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (finalIso: string) => Promise<void>;
    rankedSlots: RankedSlot[];
}

export default function FinalizePollModal({ isOpen, onClose, onConfirm, rankedSlots }: FinalizePollModalProps) {
    const [selectedIso, setSelectedIso] = useState<string | null>(rankedSlots[0]?.fullIso || null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = async () => {
        if (!selectedIso) return;
        setIsSubmitting(true);
        await onConfirm(selectedIso);
        setIsSubmitting(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                                <CalendarCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Finalize Poll</h2>
                                <p className="text-sm text-gray-500">Select the final time to close voting.</p>
                            </div>
                        </div>
                    </div>

                    {/* Warning Banner */}
                    <div className="bg-amber-50 px-6 py-3 border-b border-amber-100 flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-800 leading-relaxed font-medium">
                            Warning: This action will <strong>close the poll</strong> immediately. Participants will no longer be able to vote.
                        </p>
                    </div>

                    {/* Slots List (Scrollable) */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                        {rankedSlots.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">No votes have been cast yet.</p>
                        ) : (
                            rankedSlots.map((slot, idx) => {
                                const isSelected = selectedIso === slot.fullIso;
                                return (
                                    <button
                                        key={slot.fullIso}
                                        onClick={() => setSelectedIso(slot.fullIso)}
                                        className={`
                                            w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all
                                            ${isSelected
                                            ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-1 ring-indigo-600'
                                            : 'border-gray-100 bg-white hover:border-indigo-200 hover:bg-gray-50'
                                        }
                                        `}
                                    >
                                        <div className="flex items-center gap-4 text-left">
                                            {/* Rank Badge */}
                                            <div className={`
                                                w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                                ${idx === 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}
                                            `}>
                                                {idx === 0 ? <Trophy className="w-4 h-4" /> : `#${idx + 1}`}
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2 font-bold text-gray-900">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    {slot.time}
                                                </div>
                                                <div className="text-xs text-gray-500 font-medium">
                                                    {slot.date}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${isSelected ? 'bg-indigo-200 text-indigo-800' : 'bg-gray-100 text-gray-600'}`}>
                                                {slot.count} votes
                                            </div>
                                            <div className={`
                                                w-5 h-5 rounded-full border flex items-center justify-center
                                                ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'}
                                            `}>
                                                {isSelected && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!selectedIso || isSubmitting}
                            className="flex-1 py-3 rounded-xl font-semibold text-white bg-indigo-900 hover:bg-black transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    Confirm Final Time
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}