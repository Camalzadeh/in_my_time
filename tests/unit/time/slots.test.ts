import {
    parseWallTime,
    parseCalendarDate,
    generateSlotsForDate,
    generateSlots,
    slotLabel,
    expandDateRange,
    nextWeekRange,
    nextMonthRange,
    calendarDayString,
} from '@/lib/time/slots';

describe('parseWallTime', () => {
    it('parses a valid time', () => {
        expect(parseWallTime('09:00')).toEqual({ hour: 9, minute: 0 });
        expect(parseWallTime('9:05')).toEqual({ hour: 9, minute: 5 });
        expect(parseWallTime('23:59')).toEqual({ hour: 23, minute: 59 });
    });

    it('rejects malformed input', () => {
        expect(parseWallTime('24:00')).toBeNull();
        expect(parseWallTime('09:60')).toBeNull();
        expect(parseWallTime('9')).toBeNull();
        expect(parseWallTime('')).toBeNull();
        expect(parseWallTime('nine')).toBeNull();
    });
});

describe('parseCalendarDate', () => {
    it('parses a valid date', () => {
        expect(parseCalendarDate('2026-09-10')).toEqual({ year: 2026, month: 9, day: 10 });
    });

    it('rejects dates that do not exist', () => {
        expect(parseCalendarDate('2026-02-31')).toBeNull();
        expect(parseCalendarDate('2026-13-01')).toBeNull();
        expect(parseCalendarDate('2026-9-1')).toBeNull();
        expect(parseCalendarDate('')).toBeNull();
    });

    it('knows about leap years', () => {
        expect(parseCalendarDate('2028-02-29')).toEqual({ year: 2028, month: 2, day: 29 });
        expect(parseCalendarDate('2026-02-29')).toBeNull();
    });
});

describe('generateSlotsForDate', () => {
    const baku = {
        dailyStartTime: '09:00',
        dailyEndTime: '12:00',
        slotDuration: 60,
        timezone: 'Asia/Baku',
    };

    it('builds slots in the poll’s zone', () => {
        const slots = generateSlotsForDate('2026-09-10', baku);

        expect(slots.map((s) => s.toISOString())).toEqual([
            '2026-09-10T05:00:00.000Z', // 09:00 in Baku
            '2026-09-10T06:00:00.000Z', // 10:00
            '2026-09-10T07:00:00.000Z', // 11:00
        ]);
    });

    it('excludes the end time', () => {
        const slots = generateSlotsForDate('2026-09-10', baku);
        expect(slots).toHaveLength(3);
        expect(slotLabel(slots[slots.length - 1], 'Asia/Baku')).toBe('11:00');
    });

    it('supports half-hour steps', () => {
        const slots = generateSlotsForDate('2026-09-10', { ...baku, slotDuration: 30 });
        expect(slots).toHaveLength(6);
        expect(slots.map((s) => slotLabel(s, 'Asia/Baku'))).toEqual([
            '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        ]);
    });

    it('returns nothing when the start is not before the end', () => {
        expect(generateSlotsForDate('2026-09-10', { ...baku, dailyStartTime: '12:00' })).toEqual([]);
        expect(generateSlotsForDate('2026-09-10', { ...baku, dailyStartTime: '13:00' })).toEqual([]);
    });

    it('returns nothing for bad input instead of throwing', () => {
        expect(generateSlotsForDate('not-a-date', baku)).toEqual([]);
        expect(generateSlotsForDate('2026-09-10', { ...baku, dailyStartTime: '?' })).toEqual([]);
        expect(generateSlotsForDate('2026-09-10', { ...baku, slotDuration: 0 })).toEqual([]);
        expect(generateSlotsForDate('2026-09-10', { ...baku, slotDuration: -30 })).toEqual([]);
    });

    it('keeps wall-clock times stable across a DST change', () => {
        // Berlin, 2026-10-25: summer time ends. Slots must still start at 09:00.
        const slots = generateSlotsForDate('2026-10-25', {
            dailyStartTime: '09:00',
            dailyEndTime: '12:00',
            slotDuration: 60,
            timezone: 'Europe/Berlin',
        });

        expect(slots.map((s) => slotLabel(s, 'Europe/Berlin'))).toEqual(['09:00', '10:00', '11:00']);
    });
});

describe('generateSlots', () => {
    const config = {
        targetDates: ['2026-09-11', '2026-09-10'],
        dailyStartTime: '09:00',
        dailyEndTime: '11:00',
        slotDuration: 60,
        timezone: 'Asia/Baku',
    };

    it('merges every day and sorts by date', () => {
        const slots = generateSlots(config);

        expect(slots).toHaveLength(4);
        expect(slots.map((s) => s.toISOString())).toEqual([
            '2026-09-10T05:00:00.000Z',
            '2026-09-10T06:00:00.000Z',
            '2026-09-11T05:00:00.000Z',
            '2026-09-11T06:00:00.000Z',
        ]);
    });

    it('does not mutate the input array', () => {
        const dates = ['2026-09-11', '2026-09-10'];
        generateSlots({ ...config, targetDates: dates });
        expect(dates).toEqual(['2026-09-11', '2026-09-10']);
    });

    it('returns nothing when there are no days', () => {
        expect(generateSlots({ ...config, targetDates: [] })).toEqual([]);
    });
});

describe('expandDateRange', () => {
    it('includes both ends', () => {
        expect(expandDateRange('2026-09-10', '2026-09-13')).toEqual([
            '2026-09-10', '2026-09-11', '2026-09-12', '2026-09-13',
        ]);
    });

    it('handles a single day', () => {
        expect(expandDateRange('2026-09-10', '2026-09-10')).toEqual(['2026-09-10']);
    });

    it('crosses month and year boundaries', () => {
        expect(expandDateRange('2026-12-30', '2027-01-02')).toEqual([
            '2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02',
        ]);
    });

    it('returns nothing for a reversed or malformed range', () => {
        expect(expandDateRange('2026-09-13', '2026-09-10')).toEqual([]);
        expect(expandDateRange('not-a-date', '2026-09-10')).toEqual([]);
    });
});

describe('nextWeekRange', () => {
    it('runs from next Monday to the following Sunday', () => {
        // 2026-09-10 is a Thursday.
        const range = nextWeekRange('Asia/Baku', new Date('2026-09-10T08:00:00.000Z'));
        expect(range).toEqual({ start: '2026-09-14', end: '2026-09-20' });
    });

    it('skips to the following week when today is Monday', () => {
        const range = nextWeekRange('Asia/Baku', new Date('2026-09-14T08:00:00.000Z'));
        expect(range).toEqual({ start: '2026-09-21', end: '2026-09-27' });
    });

    it('decides "today" in the given zone', () => {
        // 22:00 UTC is already the next day in Baku.
        const utc = nextWeekRange('UTC', new Date('2026-09-13T22:00:00.000Z'));
        const baku = nextWeekRange('Asia/Baku', new Date('2026-09-13T22:00:00.000Z'));

        expect(utc.start).toBe('2026-09-14');   // still Sunday → next Monday
        expect(baku.start).toBe('2026-09-21');  // already Monday → the one after
    });
});

describe('nextMonthRange', () => {
    it('spans the whole of next month', () => {
        expect(nextMonthRange('UTC', new Date('2026-09-10T08:00:00.000Z')))
            .toEqual({ start: '2026-10-01', end: '2026-10-31' });
    });

    it('crosses the year boundary', () => {
        expect(nextMonthRange('UTC', new Date('2026-12-10T08:00:00.000Z')))
            .toEqual({ start: '2027-01-01', end: '2027-01-31' });
    });

    it('gets February’s length right', () => {
        expect(nextMonthRange('UTC', new Date('2028-01-10T08:00:00.000Z')))
            .toEqual({ start: '2028-02-01', end: '2028-02-29' });
    });
});

describe('calendarDayString', () => {
    it('resolves an instant to a calendar day in the zone', () => {
        const instant = new Date('2026-09-13T22:00:00.000Z');

        expect(calendarDayString(instant, 'UTC')).toBe('2026-09-13');
        expect(calendarDayString(instant, 'Asia/Baku')).toBe('2026-09-14');
    });
});
