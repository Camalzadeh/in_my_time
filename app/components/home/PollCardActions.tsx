'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EyeOff, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { API_ROUTES } from '@/lib/routes';

// Getting rid of a poll.
//
// There was no way to delete one at all, so a list of your own polls filled up
// and stayed full. Two different things are wanted depending on whose poll it
// is, and conflating them would be the sort of button that does more than it
// says:
//
//   - your own poll: delete it, for everyone, permanently
//   - someone else's: take it off this list and leave the poll alone
//
// Both ask first, in the row itself rather than in a dialog — the question is
// short and the answer is one click away either way.

interface Props {
    pollId: string;
    isOwner: boolean;
}

export default function PollCardActions({ pollId, isOwner }: Props) {
    const router = useRouter();
    const [isConfirming, setConfirming] = useState(false);
    const [isBusy, setBusy] = useState(false);

    const run = async () => {
        setBusy(true);

        try {
            const response = await fetch(
                isOwner ? API_ROUTES.POLL_DETAIL_API(pollId) : API_ROUTES.FORGET_POLL_API(pollId),
                { method: isOwner ? 'DELETE' : 'POST' },
            );

            if (!response.ok) {
                const payload = await response.json().catch(() => null);
                throw new Error(payload?.message ?? 'That did not work.');
            }

            toast.success(isOwner ? 'Poll deleted.' : 'Removed from this device.');

            // The list is server-rendered from cookies, and the response just
            // changed them.
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'That did not work.');
            setBusy(false);
            setConfirming(false);
        }
    };

    if (isConfirming) {
        return (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2.5">
                <p className="text-xs leading-relaxed text-muted-foreground">
                    {isOwner ? (
                        <>
                            Delete for <strong className="text-foreground">everyone</strong>? The
                            votes go with it and it cannot be undone.
                        </>
                    ) : (
                        <>
                            Take it off this list? Your vote stays in the poll, but this device will
                            no longer be able to change it.
                        </>
                    )}
                </p>

                <div className="flex shrink-0 items-center gap-1">
                    <button
                        type="button"
                        onClick={() => setConfirming(false)}
                        disabled={isBusy}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={run}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-destructive px-2.5 py-1.5 text-xs font-semibold text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        {isBusy && <Loader2 className="h-3 w-3 animate-spin" aria-hidden />}
                        {isOwner ? 'Delete' : 'Remove'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-end border-t border-border px-4 py-2">
            <button
                type="button"
                onClick={() => setConfirming(true)}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                {isOwner ? (
                    <>
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        Delete
                    </>
                ) : (
                    <>
                        <EyeOff className="h-3.5 w-3.5" aria-hidden />
                        Remove from list
                    </>
                )}
            </button>
        </div>
    );
}
