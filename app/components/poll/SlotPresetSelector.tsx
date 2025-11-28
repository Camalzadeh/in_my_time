"use client";

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
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-slate-700 mb-1">
        Slot duration (min)
      </p>
      <div className="flex flex-wrap gap-1.5">
        {SLOT_PRESETS.map((preset) => {
          const isActive = value === preset.value;
          return (
            <button
              key={preset.value}
              type="button"
              onClick={() => onChange(preset.value)}
              className={`rounded-full px-3 py-1 text-[11px] border transition
                ${
                  isActive
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
            >
              {preset.label}
            </button>
          );
        })}

        <div className="flex items-center gap-1 ml-1">
          <input
            type="number"
            min={5}
            step={5}
            className="w-14 rounded-md border border-slate-200 px-2 py-1 text-[11px]"
            value={value}
            onChange={(e) => onChange(Number(e.target.value) || 0)}
          />
          <span className="text-[10px] text-slate-500">custom</span>
        </div>
      </div>
    </div>
  );
}
