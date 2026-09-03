// Slot generation — the single source of it in the project.
//
// This used to be spread across six files (`generate-slots`, `slot-generator`,
// `poll-slots`, `time-slots`, `date-ranges`, `time-to-minutes`) written three
// different ways: one used `setHours`, one `date-fns`, one
// `new Date("...T...")`. All three worked in local time, so all three could
// disagree. They are all here now.

import { zonedWallTimeToUtc, formatInZone } from './zone';

/** "09:00" → {hour: 9, minute: 0}. Null when the format is wrong. */
export function parseWallTime(value: string): { hour: number; minute: number } | null {
    const match = /^(\d{1,2}):(\d{2})$/.exec(value);
    if (!match) return null;

    const hour = Number(match[1]);
    const minute = Number(match[2]);

    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

    return { hour, minute };
}

/** "2026-09-10" → {year, month, day}. Null when the format is wrong. */
export function parseCalendarDate(value: string): { year: number; month: number; day: number } | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    if (month < 1 || month > 12 || day < 1 || day > 31) return null;

    // Catches dates like 31 February: build it in UTC and read it back.
    const probe = new Date(Date.UTC(year, month - 1, day));
    if (probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) return null;

    return { year, month, day };
}

export interface SlotConfig {
    /** Calendar days, "YYYY-MM-DD". */
    targetDates: string[];
    /** Wall-clock times, "HH:mm", in the poll's zone. */
    dailyStartTime: string;
    dailyEndTime: string;
    /** Minutes. */
    slotDuration: number;
    /** IANA zone name, e.g. "Asia/Baku". */
    timezone: string;
}

/**
 * One day's slots, as UTC instants.
 *
 * Returns nothing when the start is not before the end — ranges that wrap past
 * midnight are not supported.
 */
export function generateSlotsForDate(date: string, config: Omit<SlotConfig, 'targetDates'>): Date[] {
    const day = parseCalendarDate(date);
    const start = parseWallTime(config.dailyStartTime);
    const end = parseWallTime(config.dailyEndTime);

    if (!day || !start || !end) return [];
    if (!Number.isFinite(config.slotDuration) || config.slotDuration <= 0) return [];

    const startMinutes = start.hour * 60 + start.minute;
    const endMinutes = end.hour * 60 + end.minute;
    if (startMinutes >= endMinutes) return [];

    const slots: Date[] = [];

    for (let m = startMinutes; m < endMinutes; m += config.slotDuration) {
        slots.push(
            zonedWallTimeToUtc(day.year, day.month, day.day, Math.floor(m / 60), m % 60, config.timezone),
        );
    }

    return slots;
}

/** Every day's slots, in date order. */
export function generateSlots(config: SlotConfig): Date[] {
    const { targetDates, ...rest } = config;

    return [...targetDates]
        .sort()
        .flatMap((date) => generateSlotsForDate(date, rest));
}

/** How a slot reads in the poll's own zone, e.g. "14:30". */
export function slotLabel(slot: Date, timezone: string): string {
    return formatInZone(slot, timezone);
}

/**
 * Every day between two dates, inclusive, as "YYYY-MM-DD".
 * Empty for a malformed or reversed range.
 */
export function expandDateRange(start: string, end: string): string[] {
    const from = parseCalendarDate(start);
    const to = parseCalendarDate(end);
    if (!from || !to) return [];

    const cursor = Date.UTC(from.year, from.month - 1, from.day);
    const last = Date.UTC(to.year, to.month - 1, to.day);
    if (cursor > last) return [];

    const days: string[] = [];
    for (let t = cursor; t <= last; t += 86_400_000) {
        days.push(new Date(t).toISOString().slice(0, 10));
    }

    return days;
}

/** Next Monday through Sunday, relative to today in the given zone. */
export function nextWeekRange(timezone: string, now = new Date()): { start: string; end: string } {
    const today = calendarDayInZone(now, timezone);
    const todayUtc = Date.UTC(today.year, today.month - 1, today.day);

    // getUTCDay: 0 is Sunday. Always move to the *next* Monday, never today.
    const weekday = new Date(todayUtc).getUTCDay();
    const untilMonday = (8 - weekday) % 7 || 7;

    const monday = todayUtc + untilMonday * 86_400_000;

    return {
        start: new Date(monday).toISOString().slice(0, 10),
        end: new Date(monday + 6 * 86_400_000).toISOString().slice(0, 10),
    };
}

/** The first and last day of next month, relative to today in the given zone. */
export function nextMonthRange(timezone: string, now = new Date()): { start: string; end: string } {
    const today = calendarDayInZone(now, timezone);

    const firstOfNext = Date.UTC(today.year, today.month, 1);
    const lastOfNext = Date.UTC(today.year, today.month + 1, 0);

    return {
        start: new Date(firstOfNext).toISOString().slice(0, 10),
        end: new Date(lastOfNext).toISOString().slice(0, 10),
    };
}

/** Which calendar day the instant falls on, in the given zone. */
export function calendarDayInZone(
    instant: Date,
    timeZone: string,
): { year: number; month: number; day: number } {
    // en-CA always formats as "YYYY-MM-DD".
    const [year, month, day] = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    })
        .format(instant)
        .split('-')
        .map(Number);

    return { year, month, day };
}

/** Which calendar day the instant falls on, as "YYYY-MM-DD". */
export function calendarDayString(instant: Date, timeZone: string): string {
    const { year, month, day } = calendarDayInZone(instant, timeZone);
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
