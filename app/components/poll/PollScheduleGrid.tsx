'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Users } from 'lucide-react';

import type { DayView } from '@/lib/hooks/use-poll-manager';

// The availability grid: one column per day, one row per time slot.
//
// The old layout showed a single day at a time behind a date picker, so
// comparing days meant clicking through them one by one — which is the whole
// job this tool exists to do. Every day is on screen at once now, and the grid
// scrolls sideways when there are more days than fit.
//
// Selecting:
//   - mouse or pen: click a cell, or press and drag across several
//   - touch: tap cells; drag is deliberately not bound, because it would fight
//     with scrolling the grid. The row and column headers select a whole time
//     or a whole day instead, which is faster than dragging anyway.

interface Props {
    days: DayView[];
    selection: string[];
    maxVoteCount: number;
    disabled: boolean;
    timezone: string;
    onToggle: (iso: string) => void;
    onSetMany: (isos: string[], selected: boolean) => void;
}

/** Background for a slot, by how many people picked it. */
function densityClass(count: number, max: number): string {
    if (count === 0) return 'bg-card';

    const ratio = count / max;
    if (ratio <= 0.25) return 'bg-primary/15';
    if (ratio <= 0.5) return 'bg-primary/35';
    if (ratio <= 0.75) return 'bg-primary/55';
    return 'bg-primary/80';
}

/** Text colour that stays readable as the background fills in. */
function densityText(count: number, max: number): string {
    if (count === 0) return 'text-muted-foreground';
    return count / max > 0.55 ? 'text-primary-foreground' : 'text-foreground';
}

export default function PollScheduleGrid({
    days,
    selection,
    maxVoteCount,
    disabled,
    timezone,
    onToggle,
    onSetMany,
}: Props) {
    const selected = useMemo(() => new Set(selection), [selection]);

    // While dragging, `paintMode` is what we are doing to every cell we touch:
    // selecting or deselecting. It is decided by the first cell of the drag, so
    // dragging across a mixed area gives one consistent result.
    const [paintMode, setPaintMode] = useState<boolean | null>(null);
    const painted = useRef<Set<string>>(new Set());

    // A mouse or pen press is handled on pointerdown, and the click that
    // follows must not toggle the cell straight back. Touch and keyboard never
    // set this, so their clicks fall through and do the toggling.
    const pointerHandled = useRef(false);

    const endDrag = useCallback(() => {
        setPaintMode(null);
        painted.current.clear();
    }, []);

    useEffect(() => {
        if (paintMode === null) return;

        window.addEventListener('pointerup', endDrag);
        window.addEventListener('pointercancel', endDrag);

        return () => {
            window.removeEventListener('pointerup', endDrag);
            window.removeEventListener('pointercancel', endDrag);
        };
    }, [paintMode, endDrag]);

    const paint = useCallback(
        (iso: string, mode: boolean) => {
            if (painted.current.has(iso)) return;
            painted.current.add(iso);
            onSetMany([iso], mode);
        },
        [onSetMany],
    );

    if (days.length === 0 || days[0].slots.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                <p className="font-medium text-foreground">No time slots</p>
                <p className="mt-1 text-sm text-muted-foreground">
                    This poll has no slots configured for its dates.
                </p>
            </div>
        );
    }

    // Every day runs the same start-to-end range, so the first day's labels
    // describe every row.
    const rowLabels = days[0].slots.map((slot) => slot.label);

    const toggleColumn = (day: DayView) => {
        const isos = day.slots.map((s) => s.iso);
        const allOn = isos.every((iso) => selected.has(iso));
        onSetMany(isos, !allOn);
    };

    const toggleRow = (rowIndex: number) => {
        const isos = days.map((day) => day.slots[rowIndex]?.iso).filter(Boolean) as string[];
        const allOn = isos.every((iso) => selected.has(iso));
        onSetMany(isos, !allOn);
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
                <div
                    className="min-w-max select-none"
                    // Columns: a fixed gutter for the time labels, then one per day.
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `3.5rem repeat(${days.length}, minmax(4.25rem, 1fr))`,
                    }}
                >
                    {/* Header row */}
                    <div className="sticky left-0 z-20 border-b border-r border-border bg-card px-2 py-3">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            {timezone.split('/').pop()?.replace('_', ' ')}
                        </span>
                    </div>

                    {days.map((day) => {
                        const dayTotal = day.slots.reduce((sum, s) => sum + s.count, 0);

                        return (
                            <button
                                key={day.date}
                                type="button"
                                disabled={disabled}
                                onClick={() => toggleColumn(day)}
                                title={`Select every slot on ${day.weekday}, ${day.dayLabel}`}
                                className="border-b border-border px-2 py-3 text-center transition-colors hover:bg-muted disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                            >
                                <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                    {day.weekday.slice(0, 3)}
                                </div>
                                <div className="text-sm font-semibold text-foreground">{day.dayLabel}</div>
                                {dayTotal > 0 && (
                                    <div className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                                        {dayTotal}
                                    </div>
                                )}
                            </button>
                        );
                    })}

                    {/* One row per slot */}
                    {rowLabels.map((label, rowIndex) => (
                        <Row
                            key={label}
                            label={label}
                            rowIndex={rowIndex}
                            days={days}
                            selected={selected}
                            maxVoteCount={maxVoteCount}
                            disabled={disabled}
                            paintMode={paintMode}
                            pointerHandled={pointerHandled}
                            onStartDrag={setPaintMode}
                            onPaint={paint}
                            onToggle={onToggle}
                            onToggleRow={toggleRow}
                        />
                    ))}
                </div>
            </div>

            <Legend />
        </div>
    );
}

interface RowProps {
    label: string;
    rowIndex: number;
    days: DayView[];
    selected: Set<string>;
    maxVoteCount: number;
    disabled: boolean;
    paintMode: boolean | null;
    pointerHandled: { current: boolean };
    onStartDrag: (mode: boolean) => void;
    onPaint: (iso: string, mode: boolean) => void;
    onToggle: (iso: string) => void;
    onToggleRow: (rowIndex: number) => void;
}

function Row({
    label,
    rowIndex,
    days,
    selected,
    maxVoteCount,
    disabled,
    paintMode,
    pointerHandled,
    onStartDrag,
    onPaint,
    onToggle,
    onToggleRow,
}: RowProps) {
    return (
        <>
            <button
                type="button"
                disabled={disabled}
                onClick={() => onToggleRow(rowIndex)}
                title={`Select ${label} on every day`}
                className="sticky left-0 z-10 border-r border-t border-border bg-card px-2 py-2 text-right text-xs font-medium tabular-nums text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            >
                {label}
            </button>

            {days.map((day) => {
                const slot = day.slots[rowIndex];
                if (!slot) {
                    return <div key={day.date} className="border-t border-border bg-muted/30" />;
                }

                const isSelected = selected.has(slot.iso);

                return (
                    <button
                        key={slot.iso}
                        type="button"
                        disabled={disabled}
                        aria-pressed={isSelected}
                        aria-label={`${label} on ${day.weekday} ${day.dayLabel}. ${slot.count} ${
                            slot.count === 1 ? 'person' : 'people'
                        } available${isSelected ? '. Selected' : ''}`}
                        title={slot.voters.length ? slot.voters.join(', ') : undefined}
                        onPointerDown={(event) => {
                            // Touch is left alone: painting would fight the
                            // horizontal scroll this grid depends on.
                            if (event.pointerType === 'touch') return;

                            event.preventDefault();
                            pointerHandled.current = true;

                            const mode = !isSelected;
                            onStartDrag(mode);
                            onPaint(slot.iso, mode);
                        }}
                        onPointerEnter={() => {
                            if (paintMode !== null) onPaint(slot.iso, paintMode);
                        }}
                        onClick={() => {
                            // Mouse and pen were already handled on pointerdown.
                            if (pointerHandled.current) {
                                pointerHandled.current = false;
                                return;
                            }
                            onToggle(slot.iso);
                        }}
                        className={`
                            relative flex h-12 items-center justify-center border-t border-l border-border sm:h-11
                            text-xs font-semibold tabular-nums transition-colors
                            focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset
                            disabled:pointer-events-none
                            ${densityClass(slot.count, maxVoteCount)}
                            ${densityText(slot.count, maxVoteCount)}
                            ${isSelected ? 'ring-2 ring-inset ring-ring' : 'hover:brightness-95 dark:hover:brightness-125'}
                        `}
                    >
                        {/* The count is written out, not only encoded in colour. */}
                        {slot.count > 0 && <span>{slot.count}</span>}

                        {isSelected && (
                            <Check className="absolute right-1 top-1 h-3 w-3 stroke-[3] text-ring" aria-hidden />
                        )}
                    </button>
                );
            })}
        </>
    );
}

function Legend() {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" aria-hidden />
                Numbers show how many people picked that time
            </span>

            <span className="inline-flex items-center gap-2">
                <span>Fewer</span>
                <span className="flex overflow-hidden rounded border border-border">
                    <span className="h-3 w-5 bg-card" />
                    <span className="h-3 w-5 bg-primary/15" />
                    <span className="h-3 w-5 bg-primary/35" />
                    <span className="h-3 w-5 bg-primary/55" />
                    <span className="h-3 w-5 bg-primary/80" />
                </span>
                <span>More</span>
            </span>
        </div>
    );
}
