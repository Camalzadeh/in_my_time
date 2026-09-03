import { zonedWallTimeToUtc, formatInZone, isValidTimeZone } from '@/lib/time/zone';

describe('zonedWallTimeToUtc', () => {
    it('converts a zone with a fixed offset (Baku is UTC+4, no DST)', () => {
        const utc = zonedWallTimeToUtc(2026, 9, 10, 14, 0, 'Asia/Baku');
        expect(utc.toISOString()).toBe('2026-09-10T10:00:00.000Z');
    });

    it('accounts for summer time (Berlin in September is CEST, UTC+2)', () => {
        const utc = zonedWallTimeToUtc(2026, 9, 10, 14, 0, 'Europe/Berlin');
        expect(utc.toISOString()).toBe('2026-09-10T12:00:00.000Z');
    });

    it('accounts for winter time (Berlin in January is CET, UTC+1)', () => {
        const utc = zonedWallTimeToUtc(2026, 1, 10, 14, 0, 'Europe/Berlin');
        expect(utc.toISOString()).toBe('2026-01-10T13:00:00.000Z');
    });

    it('gives different instants for the same wall time in different zones', () => {
        const baku = zonedWallTimeToUtc(2026, 9, 10, 14, 0, 'Asia/Baku');
        const berlin = zonedWallTimeToUtc(2026, 9, 10, 14, 0, 'Europe/Berlin');

        // Exactly the distinction the old code threw away.
        expect(baku.getTime()).not.toBe(berlin.getTime());
        expect(berlin.getTime() - baku.getTime()).toBe(2 * 60 * 60 * 1000);
    });

    it('is the identity for UTC', () => {
        const utc = zonedWallTimeToUtc(2026, 9, 10, 14, 30, 'UTC');
        expect(utc.toISOString()).toBe('2026-09-10T14:30:00.000Z');
    });

    it('still returns a valid instant for a time that DST skips over', () => {
        // Berlin, 2026-03-29: the clock jumps 02:00 → 03:00, so 02:30 never happens.
        const utc = zonedWallTimeToUtc(2026, 3, 29, 2, 30, 'Europe/Berlin');

        expect(Number.isNaN(utc.getTime())).toBe(false);
        expect(utc.toISOString()).toBe('2026-03-29T01:30:00.000Z');
    });

    it('does not break on a time that DST repeats', () => {
        // Berlin, 2026-10-25: 02:30 happens twice. One of them has to win.
        const utc = zonedWallTimeToUtc(2026, 10, 25, 2, 30, 'Europe/Berlin');

        expect(Number.isNaN(utc.getTime())).toBe(false);
        expect(formatInZone(utc, 'Europe/Berlin')).toBe('02:30');
    });

    it('handles midnight, which some ICU builds report as hour 24', () => {
        const utc = zonedWallTimeToUtc(2026, 9, 10, 0, 0, 'Asia/Baku');
        expect(utc.toISOString()).toBe('2026-09-09T20:00:00.000Z');
    });
});

describe('formatInZone', () => {
    it('renders an instant as wall-clock time in the zone', () => {
        const instant = new Date('2026-09-10T10:00:00.000Z');

        expect(formatInZone(instant, 'Asia/Baku')).toBe('14:00');
        expect(formatInZone(instant, 'Europe/Berlin')).toBe('12:00');
        expect(formatInZone(instant, 'UTC')).toBe('10:00');
    });

    it('round-trips with zonedWallTimeToUtc', () => {
        const zones = ['Asia/Baku', 'Europe/Berlin', 'America/New_York', 'UTC'];

        for (const zone of zones) {
            const utc = zonedWallTimeToUtc(2026, 7, 4, 9, 15, zone);
            expect(formatInZone(utc, zone)).toBe('09:15');
        }
    });
});

describe('isValidTimeZone', () => {
    it('accepts real zones', () => {
        expect(isValidTimeZone('Asia/Baku')).toBe(true);
        expect(isValidTimeZone('UTC')).toBe(true);
    });

    it('rejects made-up and empty values', () => {
        expect(isValidTimeZone('Mars/Olympus')).toBe(false);
        expect(isValidTimeZone('')).toBe(false);
    });
});
