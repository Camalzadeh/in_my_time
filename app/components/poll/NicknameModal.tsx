'use client';

import { useEffect, useRef, useState } from 'react';

import { LIMITS } from '@/models/Poll';

interface Props {
    isOpen: boolean;
    initialName: string | null;
    onSave: (name: string) => void;
    onClose: () => void;
    /** False while a name is still required, so the dialog cannot be escaped. */
    dismissible: boolean;
}

export default function NicknameModal({ isOpen, initialName, onSave, onClose, dismissible }: Props) {
    const [name, setName] = useState(initialName ?? '');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setName(initialName ?? '');
            inputRef.current?.focus();
        }
    }, [isOpen, initialName]);

    useEffect(() => {
        if (!isOpen || !dismissible) return;

        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isOpen, dismissible, onClose]);

    if (!isOpen) return null;

    const trimmed = name.trim();

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        if (trimmed) onSave(trimmed);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
                onClick={dismissible ? onClose : undefined}
                aria-hidden
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="nickname-title"
                className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl"
            >
                <h2 id="nickname-title" className="text-lg font-bold text-foreground">
                    What should we call you?
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Other participants will see this name next to your picks.
                </p>

                <form onSubmit={submit} className="mt-4 space-y-4">
                    <div>
                        <label htmlFor="nickname" className="sr-only">
                            Your name
                        </label>
                        <input
                            ref={inputRef}
                            id="nickname"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            maxLength={LIMITS.VOTER_NAME_MAX}
                            autoComplete="nickname"
                            placeholder="e.g. Alex"
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                    </div>

                    <div className="flex gap-3">
                        {dismissible && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                Cancel
                            </button>
                        )}

                        <button
                            type="submit"
                            disabled={!trimmed}
                            className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                            Continue
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
