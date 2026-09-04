'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Copy, ExternalLink, Loader2, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

import { API_ROUTES, UI_PATHS } from '@/lib/routes';
import { LIMITS } from '@/lib/limits';
import { guessTimeZone } from '@/lib/time/zone';
import {
    expandDateRange,
    generateSlotsForDate,
    nextMonthRange,
    nextWeekRange,
    slotLabel,
} from '@/lib/time/slots';

const DURATION_PRESETS = [15, 30, 60] as const;

export default function CreatePollForm() {
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const [dates, setDates] = useState<string[]>([]);
    const [singleDate, setSingleDate] = useState('');
    const [rangeStart, setRangeStart] = useState('');
    const [rangeEnd, setRangeEnd] = useState('');

    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    const [duration, setDuration] = useState<number>(60);

    // Resolved after mount so the server and the browser render the same markup.
    const [timezone, setTimezone] = useState('UTC');
    useEffect(() => setTimezone(guessTimeZone()), []);

    const [isSubmitting, setSubmitting] = useState(false);
    const [createdId, setCreatedId] = useState<string | null>(null);

    const zones = useMemo(() => {
        try {
            return Intl.supportedValuesOf('timeZone');
        } catch {
            return [timezone];
        }
    }, [timezone]);

    const addDates = (incoming: string[]) => {
        if (incoming.length === 0) return;

        setDates((previous) => {
            const merged = [...new Set([...previous, ...incoming])].sort();

            if (merged.length > LIMITS.DATES_MAX) {
                toast.error(`You can pick at most ${LIMITS.DATES_MAX} days.`);
                return previous;
            }

            return merged;
        });
    };

    const preview = useMemo(() => {
        if (dates.length === 0) return [];

        return generateSlotsForDate(dates[0], {
            dailyStartTime: startTime,
            dailyEndTime: endTime,
            slotDuration: duration,
            timezone,
        });
    }, [dates, startTime, endTime, duration, timezone]);

    const totalSlots = preview.length * dates.length;

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch(API_ROUTES.POLLS_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    config: {
                        targetDates: dates,
                        dailyStartTime: startTime,
                        dailyEndTime: endTime,
                        slotDuration: duration,
                        timezone,
                    },
                }),
            });

            const payload = await response.json();

            if (!response.ok) {
                // The server names the field now, so show what it said.
                toast.error(payload?.message ?? 'Could not create the poll.');
                return;
            }

            setCreatedId(payload.pollId);
        } catch {
            toast.error('Could not reach the server. Check your connection.');
        } finally {
            setSubmitting(false);
        }
    };

    if (createdId) {
        return <SuccessPanel pollId={createdId} onOpen={() => router.push(UI_PATHS.POLL_DETAIL(createdId))} />;
    }

    const canSubmit = title.trim().length > 0 && dates.length > 0 && preview.length > 0;

    return (
        <form onSubmit={submit} className="space-y-6">
            <Section title="What is it about?">
                <Field label="Title" required htmlFor="title">
                    <input
                        id="title"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        maxLength={LIMITS.TITLE_MAX}
                        required
                        placeholder="Sprint review, study session, team lunch…"
                        className={inputClass}
                    />
                </Field>

                <Field label="Description" htmlFor="description" hint="Optional">
                    <textarea
                        id="description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        maxLength={LIMITS.DESCRIPTION_MAX}
                        rows={2}
                        placeholder="Anything participants should know."
                        className={inputClass}
                    />
                </Field>
            </Section>

            <Section
                title="Which days?"
                action={
                    dates.length > 0 ? (
                        <button
                            type="button"
                            onClick={() => setDates([])}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <Trash2 className="h-3 w-3" aria-hidden />
                            Clear all
                        </button>
                    ) : null
                }
            >
                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => addDates(rangeToDates(nextWeekRange(timezone)))} className={chipClass}>
                        Next week
                    </button>
                    <button type="button" onClick={() => addDates(rangeToDates(nextMonthRange(timezone)))} className={chipClass}>
                        Next month
                    </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Add a day" htmlFor="single-date">
                        <div className="flex gap-2">
                            <input
                                id="single-date"
                                type="date"
                                value={singleDate}
                                onChange={(event) => setSingleDate(event.target.value)}
                                className={`${inputClass} min-w-0 flex-1`}
                            />
                            <button
                                type="button"
                                disabled={!singleDate}
                                onClick={() => {
                                    addDates([singleDate]);
                                    setSingleDate('');
                                }}
                                className={iconButtonClass}
                            >
                                <Plus className="h-4 w-4" aria-hidden />
                                <span className="sr-only">Add this day</span>
                            </button>
                        </div>
                    </Field>

                    <Field label="Add a range" htmlFor="range-start">
                        <div className="flex flex-wrap gap-2">
                            <input
                                id="range-start"
                                type="date"
                                value={rangeStart}
                                onChange={(event) => setRangeStart(event.target.value)}
                                className={`${inputClass} min-w-0 flex-1`}
                                aria-label="Range start"
                            />
                            <input
                                type="date"
                                value={rangeEnd}
                                onChange={(event) => setRangeEnd(event.target.value)}
                                className={`${inputClass} min-w-0 flex-1`}
                                aria-label="Range end"
                            />
                            <button
                                type="button"
                                disabled={!rangeStart || !rangeEnd}
                                onClick={() => {
                                    const expanded = expandDateRange(rangeStart, rangeEnd);
                                    if (expanded.length === 0) {
                                        toast.error('That range runs backwards.');
                                        return;
                                    }
                                    addDates(expanded);
                                    setRangeStart('');
                                    setRangeEnd('');
                                }}
                                className={iconButtonClass}
                            >
                                <Plus className="h-4 w-4" aria-hidden />
                                <span className="sr-only">Add this range</span>
                            </button>
                        </div>
                    </Field>
                </div>

                {dates.length > 0 && (
                    <ul className="flex flex-wrap gap-1.5" aria-label="Selected days">
                        {dates.map((date) => (
                            <li key={date}>
                                <button
                                    type="button"
                                    onClick={() => setDates((previous) => previous.filter((d) => d !== date))}
                                    className="group inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-xs font-medium tabular-nums text-foreground transition-colors hover:border-destructive/40 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    {date}
                                    <X className="h-3 w-3 opacity-40 group-hover:opacity-100" aria-hidden />
                                    <span className="sr-only">Remove {date}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </Section>

            <Section title="What hours?">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="From" htmlFor="start-time">
                        <input
                            id="start-time"
                            type="time"
                            value={startTime}
                            onChange={(event) => setStartTime(event.target.value)}
                            className={inputClass}
                        />
                    </Field>
                    <Field label="To" htmlFor="end-time">
                        <input
                            id="end-time"
                            type="time"
                            value={endTime}
                            onChange={(event) => setEndTime(event.target.value)}
                            className={inputClass}
                        />
                    </Field>
                </div>

                <Field label="Slot length" htmlFor="duration">
                    <div className="flex flex-wrap items-center gap-2">
                        {DURATION_PRESETS.map((minutes) => (
                            <button
                                key={minutes}
                                type="button"
                                onClick={() => setDuration(minutes)}
                                aria-pressed={duration === minutes}
                                className={
                                    duration === minutes
                                        ? 'inline-flex min-h-9 items-center rounded-lg bg-primary px-3.5 text-sm font-semibold text-primary-foreground'
                                        : chipClass
                                }
                            >
                                {minutes} min
                            </button>
                        ))}

                        <input
                            id="duration"
                            type="number"
                            min={LIMITS.SLOT_DURATION_MIN}
                            max={LIMITS.SLOT_DURATION_MAX}
                            step={5}
                            value={duration}
                            onChange={(event) => setDuration(Number(event.target.value) || 0)}
                            className="h-9 w-20 rounded-lg border border-border bg-background px-2 text-center text-base font-semibold tabular-nums text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
                            aria-label="Custom slot length in minutes"
                        />
                    </div>
                </Field>

                <Field
                    label="Time zone"
                    htmlFor="timezone"
                    hint="Everyone sees these times in this zone"
                >
                    <select
                        id="timezone"
                        value={timezone}
                        onChange={(event) => setTimezone(event.target.value)}
                        className={inputClass}
                    >
                        {zones.map((zone) => (
                            <option key={zone} value={zone}>
                                {zone.replace('_', ' ')}
                            </option>
                        ))}
                    </select>
                </Field>
            </Section>

            {preview.length > 0 && (
                <div className="rounded-2xl border border-border bg-muted/40 p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                        {dates.length} {dates.length === 1 ? 'day' : 'days'} · {preview.length} slots per
                        day · {totalSlots} in total
                    </p>
                    <p className="mt-2 flex flex-wrap gap-1.5">
                        {preview.slice(0, 8).map((slot) => (
                            <span
                                key={slot.toISOString()}
                                className="rounded-md bg-background px-2 py-0.5 text-xs font-medium tabular-nums text-foreground"
                            >
                                {slotLabel(slot, timezone)}
                            </span>
                        ))}
                        {preview.length > 8 && (
                            <span className="px-1 py-0.5 text-xs text-muted-foreground">
                                +{preview.length - 8} more
                            </span>
                        )}
                    </p>
                </div>
            )}

            {dates.length > 0 && preview.length === 0 && (
                <p role="alert" className="text-sm text-destructive">
                    The end time has to be after the start time.
                </p>
            )}

            <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                Create poll
            </button>
        </form>
    );
}

const rangeToDates = (range: { start: string; end: string }) => expandDateRange(range.start, range.end);

function SuccessPanel({ pollId, onOpen }: { pollId: string; onOpen: () => void }) {
    const [copied, setCopied] = useState(false);
    const url = typeof window === 'undefined' ? '' : `${window.location.origin}${UI_PATHS.POLL_DETAIL(pollId)}`;

    return (
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-6 w-6 text-primary" aria-hidden />
            </div>

            <h2 className="text-xl font-bold text-foreground">Your poll is ready</h2>
            <p className="mt-1 text-sm text-muted-foreground">
                Send this link to everyone who should vote.
            </p>

            <div className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-background p-2">
                <code className="min-w-0 flex-1 truncate px-2 text-left text-xs text-muted-foreground">
                    {url}
                </code>
                <button
                    type="button"
                    onClick={async () => {
                        try {
                            await navigator.clipboard.writeText(url);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                        } catch {
                            toast.error('Could not copy. Select the link and copy it manually.');
                        }
                    }}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>

            <button
                type="button"
                onClick={onOpen}
                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
                <ExternalLink className="h-4 w-4" aria-hidden />
                Open the poll
            </button>
        </div>
    );
}

// text-base on phones: iOS zooms the page whenever a focused field is under
// 16px, and it never zooms back out.
const inputClass =
    'w-full rounded-xl border border-border bg-background px-3 py-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:py-2.5 sm:text-sm';

const chipClass =
    'inline-flex min-h-9 items-center rounded-lg border border-border bg-background px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

const iconButtonClass =
    'inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 sm:h-11 sm:w-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

function Section({
    title,
    action,
    children,
}: {
    title: string;
    action?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">{title}</h2>
                {action}
            </div>
            {children}
        </section>
    );
}

function Field({
    label,
    htmlFor,
    hint,
    required,
    children,
}: {
    label: string;
    htmlFor: string;
    hint?: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <label htmlFor={htmlFor} className="flex items-baseline gap-2 text-xs font-medium text-foreground">
                {label}
                {required && <span className="text-destructive">*</span>}
                {hint && <span className="font-normal text-muted-foreground">{hint}</span>}
            </label>
            {children}
        </div>
    );
}
