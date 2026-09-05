import { buildDisplayGrid, describeInstant } from '@/lib/time/display';
import type { SlotConfig } from '@/lib/time/slots';

// A poll written in Baku: three one-hour slots on a single day.
const bakuMorning: SlotConfig = {
    targetDates: ['2026-09-14'],
    dailyStartTime: '09:00',
    dailyEndTime: '12:00',
    slotDuration: 60,
    timezone: 'Asia/Baku',
};

describe('buildDisplayGrid', () => {
    it('shows the poll unchanged in its own zone', () => {
        const grid = buildDisplayGrid(bakuMorning, 'Asia/Baku');

        expect(grid.rows.map((r) => r.label)).toEqual(['09:00', '10:00', '11:00']);
        expect(grid.days.map((d) => d.key)).toEqual(['2026-09-14']);
        expect(grid.days[0].weekday).toBe('Monday');
        expect(grid.days[0].dayLabel).toBe('Sep 14');
    });

    it('shifts the times for a viewer in another zone', () => {
        // Baku is UTC+4 year round; London in September is UTC+1.
        const grid = buildDisplayGrid(bakuMorning, 'Europe/London');

        expect(grid.rows.map((r) => r.label)).toEqual(['06:00', '07:00', '08:00']);
        expect(grid.days.map((d) => d.key)).toEqual(['2026-09-14']);
    });

    it('keeps the same instant in every zone', () => {
        const baku = buildDisplayGrid(bakuMorning, 'Asia/Baku');
        const london = buildDisplayGrid(bakuMorning, 'Europe/London');

        // 09:00 in Baku and 06:00 in London have to be one and the same slot,
        // or the two participants are voting on different meetings.
        expect(baku.cells.get('2026-09-14|09:00')).toBe(london.cells.get('2026-09-14|06:00'));
    });

    it('handles a zone whose offset is not a whole number of hours', () => {
        // Kolkata is UTC+5:30, so 09:00 in Baku is 10:30 there.
        const grid = buildDisplayGrid(bakuMorning, 'Asia/Kolkata');

        expect(grid.rows.map((r) => r.label)).toEqual(['10:30', '11:30', '12:30']);
    });

    it('moves slots onto the previous day when the viewer is far enough west', () => {
        const bakuEvening: SlotConfig = {
            ...bakuMorning,
            dailyStartTime: '22:00',
            dailyEndTime: '23:00',
        };

        // 02:00 on the 14th in Baku is 22:00 UTC on the 13th, and New York in
        // September is UTC-4 — so the slot belongs to the 13th there.
        const grid = buildDisplayGrid(
            { ...bakuEvening, dailyStartTime: '02:00', dailyEndTime: '03:00' },
            'America/New_York',
        );

        expect(grid.days.map((d) => d.key)).toEqual(['2026-09-13']);
        expect(grid.rows.map((r) => r.label)).toEqual(['18:00']);
    });

    it('splits one poll day across two columns when the viewer straddles midnight', () => {
        const acrossMidnight: SlotConfig = {
            ...bakuMorning,
            dailyStartTime: '01:00',
            dailyEndTime: '04:00',
        };

        // Berlin in September is UTC+2, two hours behind Baku: 01:00, 02:00 and
        // 03:00 in Baku are 23:00 the night before, then midnight, then 01:00.
        const grid = buildDisplayGrid(acrossMidnight, 'Europe/Berlin');

        expect(grid.days.map((d) => d.key)).toEqual(['2026-09-13', '2026-09-14']);
        expect(grid.cells.get('2026-09-13|23:00')).toBeDefined();
        expect(grid.cells.get('2026-09-14|00:00')).toBeDefined();
        expect(grid.cells.get('2026-09-14|01:00')).toBeDefined();
    });

    it('produces a row for each side of a daylight-saving change', () => {
        // Britain leaves summer time on 25 October 2026. A poll pinned to UTC
        // therefore reads one hour earlier in London after that date.
        const acrossDst: SlotConfig = {
            targetDates: ['2026-10-24', '2026-10-26'],
            dailyStartTime: '12:00',
            dailyEndTime: '13:00',
            slotDuration: 60,
            timezone: 'UTC',
        };

        const grid = buildDisplayGrid(acrossDst, 'Europe/London');

        expect(grid.rows.map((r) => r.label)).toEqual(['12:00', '13:00']);
        expect(grid.cells.get('2026-10-24|13:00')).toBeDefined();
        expect(grid.cells.get('2026-10-26|12:00')).toBeDefined();

        // The cells that do not exist must stay absent rather than being
        // invented to square the grid off.
        expect(grid.cells.get('2026-10-24|12:00')).toBeUndefined();
        expect(grid.cells.get('2026-10-26|13:00')).toBeUndefined();
    });

    it('returns nothing for a poll with no usable slots', () => {
        const grid = buildDisplayGrid({ ...bakuMorning, dailyEndTime: '09:00' }, 'Asia/Baku');

        expect(grid.rows).toEqual([]);
        expect(grid.days).toEqual([]);
        expect(grid.cells.size).toBe(0);
    });
});

describe('describeInstant', () => {
    it('reads the instant in the zone it is given', () => {
        const iso = '2026-09-14T05:00:00.000Z';

        expect(describeInstant(iso, 'Asia/Baku')).toBe('Monday, Sep 14 · 09:00');
        expect(describeInstant(iso, 'Europe/London')).toBe('Monday, Sep 14 · 06:00');
    });
});
