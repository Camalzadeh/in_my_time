"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, Settings2 } from "lucide-react";

type SlotPresetSelectorProps = {
    value: number;
    onChange: (minutes: number) => void;
};

const SLOT_PRESETS = [
    { label: "15 min", value: 15 },
    { label: "30 min", value: 30 },
    { label: "1 hour", value: 60 },
];

export function SlotPresetSelector({ value, onChange }: SlotPresetSelectorProps) {
    const isCustom = !SLOT_PRESETS.some((p) => p.value === value);

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>Slot Duration</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                {SLOT_PRESETS.map((preset) => {
                    const isActive = value === preset.value;
                    return (
                        <motion.button
                            key={preset.value}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => onChange(preset.value)}
                            className={`
                relative px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border
                ${
                                isActive
                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200"
                                    : "bg-white border-gray-200 text-gray-600 hover:border-indigo-200 hover:bg-gray-50"
                            }
              `}
                        >
                            {preset.label}
                        </motion.button>
                    );
                })}

                <div
                    className={`
                flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-200
                ${isCustom
                        ? "bg-white border-indigo-500 ring-2 ring-indigo-100 shadow-sm"
                        : "bg-gray-50 border-gray-200 opacity-80 hover:opacity-100 hover:border-gray-300"
                    }
            `}
                >
                    <Settings2 className={`w-3.5 h-3.5 ${isCustom ? "text-indigo-500" : "text-gray-400"}`} />
                    <div className="flex items-center gap-1">
                        <input
                            type="number"
                            min={5}
                            step={5}
                            className="w-10 bg-transparent text-xs font-bold text-gray-800 outline-none placeholder-gray-400 text-center"
                            value={value}
                            onChange={(e) => onChange(Number(e.target.value) || 0)}
                        />
                        <span className="text-[10px] font-medium text-gray-400">min</span>
                    </div>
                </div>
            </div>
        </div>
    );
}