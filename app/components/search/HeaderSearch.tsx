'use client';

import { useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, Search } from 'lucide-react';

import { UI_PATHS } from '@/lib/routes';
import { getPollStatusClient } from '@/lib/data/client/get-poll-status';

// Jump straight to a poll by its id.
//
// The previous version was missing "use client" entirely and only worked
// because its parent had it. It also hand-computed a pixel width from the
// character count, typed its handlers as `any`, had no form element (so Enter
// depended on a keydown listener), and signalled failure with a red border and
// no words.

interface Props {
    /** Focus on mount — used by the mobile overlay, which exists to search. */
    autoFocus?: boolean;
    onDone?: () => void;
}

export default function HeaderSearch({ autoFocus = false, onDone }: Props) {
    const router = useRouter();
    const inputId = useId();
    const errorId = useId();

    const [pollId, setPollId] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isChecking, setChecking] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();

        const id = pollId.trim();
        if (!id) {
            setError('Enter a poll ID.');
            inputRef.current?.focus();
            return;
        }

        setError(null);
        setChecking(true);

        try {
            const status = await getPollStatusClient(id);

            if (status === 200) {
                setPollId('');
                onDone?.();
                router.push(UI_PATHS.POLL_DETAIL(id));
                return;
            }

            setError(status === 400 ? 'That does not look like a poll ID.' : 'No poll with that ID.');
        } catch {
            setError('Could not reach the server.');
        } finally {
            setChecking(false);
        }
    };

    return (
        <form onSubmit={submit} className="w-full" noValidate>
            <label htmlFor={inputId} className="sr-only">
                Open a poll by ID
            </label>

            <div className="flex items-center gap-2">
                <div className="relative min-w-0 flex-1">
                    <Search
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden
                    />
                    <input
                        ref={inputRef}
                        id={inputId}
                        value={pollId}
                        onChange={(event) => {
                            setPollId(event.target.value);
                            if (error) setError(null);
                        }}
                        // The mobile overlay exists only to search, so focusing here is
                        // what the user asked for by opening it.
                        autoFocus={autoFocus}
                        autoComplete="off"
                        spellCheck={false}
                        placeholder="Poll ID"
                        aria-invalid={error !== null}
                        aria-describedby={error ? errorId : undefined}
                        className={`h-10 w-full rounded-full border bg-muted/50 pl-10 pr-4 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 ${
                            error
                                ? 'border-destructive focus-visible:ring-destructive'
                                : 'border-transparent focus-visible:ring-ring'
                        }`}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isChecking}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                    {isChecking ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                        <ArrowRight className="h-4 w-4" aria-hidden />
                    )}
                    <span className="sr-only">{isChecking ? 'Checking' : 'Open poll'}</span>
                </button>
            </div>

            {/* Said in words, not only as a red outline, and announced when it appears. */}
            {error && (
                <p id={errorId} role="alert" className="mt-1.5 px-3 text-xs text-destructive">
                    {error}
                </p>
            )}
        </form>
    );
}
