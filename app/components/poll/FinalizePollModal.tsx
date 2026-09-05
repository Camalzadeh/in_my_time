'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

import type { RankedSlot } from '@/lib/hooks/use-poll-manager';

interface Props {
    isOpen: boolean;
    rankedSlots: RankedSlot[];
    onClose: () => void;
    onConfirm: (finalSlot: string) => Promise<void>;
}

export default function FinalizePollModal({ isOpen, rankedSlots, onClose, onConfirm }: Props) {
    const [selected, setSelected] = useState<string | null>(null);
    const [isSubmitting, setSubmitting] = useState(false);

    // Default to the current front-runner each time the dialog opens, since the
    // ranking may have moved while it was closed.
    useEffect(() => {
        if (isOpen) setSelected(rankedSlots[0]?.iso ?? null);
    }, [isOpen, rankedSlots]);

    useEffect(() => {
        if (!isOpen) return;

        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isSubmitting) onClose();
        };

        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isOpen, isSubmitting, onClose]);

    if (!isOpen) return null;

    const confirm = async () => {
        if (!selected) return;
        setSubmitting(true);
        try {
            await onConfirm(selected);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
                onClick={isSubmitting ? undefined : onClose}
                aria-hidden
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="finalize-title"
                className="relative flex max-h-[85vh] w-full max-w-md flex-col rounded-2xl border border-border bg-card shadow-xl"
            >
                <div className="border-b border-border p-5">
                    <h2 id="finalize-title" className="text-lg font-bold text-foreground">
                        Close the poll
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Pick the time you are going with.
                    </p>
                </div>

                <div className="flex items-start gap-2.5 border-b border-border bg-accent/10 px-5 py-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                    <p className="text-xs leading-relaxed text-foreground">
                        This stops all voting. It cannot be undone.
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-5">
                    {rankedSlots.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                            Nobody has voted yet, so there is nothing to pick from.
                        </p>
                    ) : (
                        <fieldset className="space-y-2">
                            <legend className="sr-only">Final time</legend>

                            {rankedSlots.slice(0, 10).map((slot, index) => (
                                <label
                                    key={slot.iso}
                                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 transition-colors ${
                                        selected === slot.iso
                                            ? 'border-ring bg-primary/5 ring-2 ring-ring'
                                            : 'border-border hover:bg-muted'
                                    }`}
                                >
                                    <span className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="final-slot"
                                            value={slot.iso}
                                            checked={selected === slot.iso}
                                            onChange={() => setSelected(slot.iso)}
                                            className="h-4 w-4 accent-[var(--primary)]"
                                        />
                                        <span>
                                            <span className="block text-sm font-semibold tabular-nums text-foreground">
                                                {slot.label}
                                            </span>
                                            <span className="block text-xs text-muted-foreground">
                                                {slot.weekday}, {slot.dayLabel}
                                            </span>
                                        </span>
                                    </span>

                                    <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                                        {slot.count} {slot.count === 1 ? 'vote' : 'votes'}
                                        {index === 0 && ' · top'}
                                    </span>
                                </label>
                            ))}
                        </fieldset>
                    )}
                </div>

                <div className="flex gap-3 border-t border-border p-5">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={confirm}
                        disabled={!selected || isSubmitting}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                        Close poll
                    </button>
                </div>
            </div>
        </div>
    );
}
