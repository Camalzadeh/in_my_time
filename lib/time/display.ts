// Turning a poll into a grid *for one particular viewer*.
//
// A poll is written in one zone — "the 14th, 09:00 to 18:00, Asia/Baku" — and
// stored as UTC instants. That much was already true. What was missing is the
// other half: everyone was shown those instants back in the *poll's* zone, so a
// participant in Berlin read "14:00" and had to work out in their head that it
// meant 12:00 where they were. The grid was honest about the instant and
// useless about the question the person actually has, which is "can I make it?"
//
// So the grid is rebuilt per viewer. The instants never change; the columns and
// rows are recomputed in whatever zone is being displayed. Two consequences
// that are correct and worth expecting:
//
//   - Days shift. A slot at 23:00 in Baku belongs to the previous day in London,
//     so the first and last columns can be partial.
//   - Rows can multiply. If the poll crosses a daylight-saving change in the
//     viewer's zone, one instant lands at 13:00 and the next week's at 12:00.
//     Both rows appear, and the cells that do not exist stay empty.
//
// Neither is a defect to design around. They are what the calendar really does.

import { generateSlots, calendarDayString, type SlotConfig } from './slots';
import { formatInZone } from './zone';

export interface GridRow {
    /** Wall-clock time in the display zone, "HH:mm". Doubles as the row key. */
    key: string;
    label: string;
    /** Minutes past midnight, for sorting. */
    minutes: number;
}

export interface GridDay {
    /** "YYYY-MM-DD" in the display zone. Doubles as the column key. */
    key: string;
    /** "Monday" */
    weekday: string;
    /** "Sep 14" */
    dayLabel: string;
}

export interface DisplayGrid {
    rows: GridRow[];
    days: GridDay[];
    /** `${dayKey}|${rowKey}` → the slot's ISO instant. Absent where there is no slot. */
    cells: Map<string, string>;
}

/** "Monday" and "Sep 14", as the instant reads in the display zone. */
function dayParts(instant: Date, timeZone: string): { weekday: string; dayLabel: string } {
    return {
        weekday: new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'long' }).format(instant),
        dayLabel: new Intl.DateTimeFormat('en-US', {
            timeZone,
            month: 'short',
            day: 'numeric',
        }).format(instant),
    };
}

/**
 * The poll's slots arranged as columns (days) and rows (times) in one zone.
 *
 * Pass the poll's own zone to get the grid its author designed; pass the
 * viewer's zone to get the one they can act on.
 */
export function buildDisplayGrid(config: SlotConfig, displayZone: string): DisplayGrid {
    const rowByKey = new Map<string, GridRow>();
    const dayByKey = new Map<string, GridDay>();
    const cells = new Map<string, string>();

    for (const slot of generateSlots(config)) {
        const dayKey = calendarDayString(slot, displayZone);
        const rowKey = formatInZone(slot, displayZone);

        if (!rowByKey.has(rowKey)) {
            const [hour, minute] = rowKey.split(':').map(Number);
            rowByKey.set(rowKey, { key: rowKey, label: rowKey, minutes: hour * 60 + minute });
        }

        if (!dayByKey.has(dayKey)) {
            dayByKey.set(dayKey, { key: dayKey, ...dayParts(slot, displayZone) });
        }

        cells.set(`${dayKey}|${rowKey}`, slot.toISOString());
    }

    return {
        rows: [...rowByKey.values()].sort((a, b) => a.minutes - b.minutes),
        days: [...dayByKey.values()].sort((a, b) => a.key.localeCompare(b.key)),
        cells,
    };
}

/** How a single instant reads in a zone: "Monday, Sep 14 · 14:00". */
export function describeInstant(iso: string, timeZone: string): string {
    const instant = new Date(iso);
    const { weekday, dayLabel } = dayParts(instant, timeZone);

    return `${weekday}, ${dayLabel} · ${formatInZone(instant, timeZone)}`;
}
