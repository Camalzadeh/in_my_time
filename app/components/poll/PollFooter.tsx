'use client';

import { Check, Loader2, Lock, Undo2 } from 'lucide-react';

interface Props {
    participantCount: number;
    selectedCount: number;
    hasUnsavedChanges: boolean;
    hasName: boolean;
    isSaving: boolean;
    isOwner: boolean;
    onSave: () => void;
    onDiscard: () => void;
    onFinalize: () => void;
    onEnterName: () => void;
}

export default function PollFooter({
    participantCount,
    selectedCount,
    hasUnsavedChanges,
    hasName,
    isSaving,
    isOwner,
    onSave,
    onDiscard,
    onFinalize,
    onEnterName,
}: Props) {
    // Sticky on small screens: with a tall grid the save button would otherwise
    // sit far below the slots the user just picked.
    return (
        <div
            className="sticky bottom-3 z-30 rounded-2xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:bottom-4 sm:p-5"
            style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-5 text-sm">
                    <div>
                        <div className="text-xl font-bold leading-none text-foreground">
                            {participantCount}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                            {participantCount === 1 ? 'participant' : 'participants'}
                        </div>
                    </div>

                    <div className="h-8 w-px bg-border" aria-hidden />

                    <div>
                        <div className="text-xl font-bold leading-none text-foreground">
                            {selectedCount}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                            {selectedCount === 1 ? 'slot picked' : 'slots picked'}
                        </div>
                    </div>
                </div>

                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:gap-3">
                    {isOwner && (
                        <button
                            type="button"
                            onClick={onFinalize}
                            className="inline-flex h-12 items-center gap-2 rounded-xl border border-border px-4 sm:h-11 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <Lock className="h-4 w-4" aria-hidden />
                            Close poll
                        </button>
                    )}

                    {hasUnsavedChanges && (
                        <button
                            type="button"
                            onClick={onDiscard}
                            disabled={isSaving}
                            className="inline-flex h-12 items-center gap-2 rounded-xl px-3 sm:h-11 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <Undo2 className="h-4 w-4" aria-hidden />
                            Discard
                        </button>
                    )}

                    {!hasName ? (
                        <button
                            type="button"
                            onClick={onEnterName}
                            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 sm:h-11 sm:min-w-[11rem] sm:flex-none text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                            Add your name
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onSave}
                            disabled={!hasUnsavedChanges || isSaving}
                            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 sm:h-11 sm:min-w-[11rem] sm:flex-none text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                                    Saving
                                </>
                            ) : hasUnsavedChanges ? (
                                <>
                                    <Check className="h-4 w-4" aria-hidden />
                                    Save availability
                                </>
                            ) : (
                                'Saved'
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Announced to screen readers when it appears, so the unsaved state is not visual only. */}
            {hasUnsavedChanges && (
                <p role="status" className="mt-3 text-xs text-muted-foreground">
                    You have unsaved changes.
                </p>
            )}
        </div>
    );
}
