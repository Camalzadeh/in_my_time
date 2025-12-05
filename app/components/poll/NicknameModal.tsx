// components/poll/NicknameModal.tsx
import React, { useState } from 'react';

interface NicknameModalProps {
    onSave: (name: string) => void;
    // Əgər istifadəçi artıq səs veribsə, modal görünməməlidir
    hasVoted: boolean;
}

export default function NicknameModal({ onSave, hasVoted }: NicknameModalProps) {
    const [inputName, setInputName] = useState('');

    const handleSave = () => {
        if (inputName.trim()) {
            onSave(inputName.trim());
        }
    };

    // Əgər istifadəçi artıq səs veribsə, və ya nickname daxil edibsə, modala ehtiyac yoxdur
    if (hasVoted) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
                <h3 className="text-xl font-bold mb-3 text-gray-800">👋 Salam, kimsiniz?</h3>
                <p className="text-gray-500 mb-5 text-sm">Cədvəldə səs vermək və adınızı görmək üçün lütfən bir ad seçin.</p>

                <input
                    type="text"
                    placeholder="Adınız/Nickname"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 mb-4"
                />

                <button
                    onClick={handleSave}
                    disabled={!inputName.trim()}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                    Təsdiqlə
                </button>
            </div>
        </div>
    );
}