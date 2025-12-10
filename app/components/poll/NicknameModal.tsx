import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircle2, Sparkles, ArrowRight, X } from 'lucide-react';

interface NicknameModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => void;
    initialName?: string | null;
}

export default function NicknameModal({ isOpen, onClose, onSave, initialName }: NicknameModalProps) {
    const [inputName, setInputName] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (isOpen && initialName) {
            setInputName(initialName);
        } else if (isOpen) {
            setInputName('');
        }
    }, [isOpen, initialName]);

    const handleSave = () => {
        if (inputName.trim()) {
            onSave(inputName.trim());
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={initialName ? onClose : undefined}
                    className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
                >
                    {initialName && (
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors z-20"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}

                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative p-8">
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 text-indigo-600 shadow-sm border border-indigo-100">
                                <Sparkles className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {initialName ? 'Edit Profile' : 'Welcome!'}
                            </h2>
                            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                                {initialName ? 'Update your display name for this poll.' : 'To start voting, please let us know who you are.'}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className={`relative group transition-all duration-300 ${isFocused ? 'scale-105' : ''}`}>
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <UserCircle2 className={`w-5 h-5 transition-colors ${isFocused ? 'text-indigo-600' : 'text-gray-400'}`} />
                                </div>
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Enter your name"
                                    value={inputName}
                                    onChange={(e) => setInputName(e.target.value)}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all shadow-inner font-medium text-lg"
                                />
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={!inputName.trim()}
                                className="w-full group relative flex items-center justify-center gap-2 py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 overflow-hidden"
                            >
                                <span>{initialName ? 'Save Changes' : 'Continue'}</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}