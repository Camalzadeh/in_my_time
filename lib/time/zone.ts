// Time zone helpers.
//
// Why this exists: when a poll says "10 September, 14:00" that is a specific
// instant — but only once you know which zone it is stated in. The old code
// used `date.setHours(14)`, which means the *browser's* zone. A participant in
// Baku and one in Berlin both clicked "14:00", stored two different instants,
// and never saw each other's votes.
//
// The rule now: a poll carries its own zone (`config.timezone`), every slot is
// computed from the wall-clock time in that zone, and what lands in the
// database is the UTC instant. Display converts back into whatever zone the
// viewer is in.
//
// No dependency needed — `Intl` already knows the tz database.

/**
 * The zone's offset from UTC at a given instant, in milliseconds.
 * Depends on the instant, because daylight saving moves it.
 */
function offsetMsAt(instant: Date, timeZone: string): number {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).formatToParts(instant);

    const at = (type: Intl.DateTimeFormatPartTypes): number => {
        const part = parts.find((p) => p.type === type);
        return part ? Number(part.value) : 0;
    };

    // Some ICU builds report midnight as hour 24.
    const asIfUtc = Date.UTC(
        at('year'),
        at('month') - 1,
        at('day'),
        at('hour') % 24,
        at('minute'),
        at('second'),
    );

    return asIfUtc - instant.getTime();
}

/**
 * Turns a wall-clock time in a zone into the UTC instant it refers to.
 *
 * It takes two passes: you need an instant to know the offset, and the offset
 * to find the instant. So guess first, then correct using the offset that
 * actually applies at the guessed instant. That second pass is what makes
 * daylight saving transitions come out right.
 */
export function zonedWallTimeToUtc(
    year: number,
    month: number, // 1-12
    day: number,
    hour: number,
    minute: number,
    timeZone: string,
): Date {
    const wallAsUtc = Date.UTC(year, month - 1, day, hour, minute);

    let instant = wallAsUtc - offsetMsAt(new Date(wallAsUtc), timeZone);
    instant = wallAsUtc - offsetMsAt(new Date(instant), timeZone);

    return new Date(instant);
}

/** The instant's wall-clock time in the zone, as "HH:mm". */
export function formatInZone(instant: Date, timeZone: string, locale = 'en-GB'): string {
    return new Intl.DateTimeFormat(locale, {
        timeZone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
    }).format(instant);
}

/** Whether the runtime recognises this IANA zone name. */
export function isValidTimeZone(timeZone: string): boolean {
    if (!timeZone) return false;
    try {
        new Intl.DateTimeFormat('en-US', { timeZone });
        return true;
    } catch {
        return false;
    }
}

/** The browser's zone, falling back to UTC. Only used to pre-fill a default. */
export function guessTimeZone(): string {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
        return 'UTC';
    }
}

/**
 * The zone's offset written the way people read it: "UTC+4", "UTC-3:30".
 *
 * Needs an instant because daylight saving moves the offset, so a poll in
 * October and the same poll in July can print different labels.
 */
export function zoneOffsetLabel(timeZone: string, at: Date = new Date()): string {
    const minutes = Math.round(offsetMsAt(at, timeZone) / 60_000);
    if (minutes === 0) return 'UTC';

    const sign = minutes < 0 ? '-' : '+';
    const abs = Math.abs(minutes);
    const hours = Math.floor(abs / 60);
    const rest = abs % 60;

    return `UTC${sign}${hours}${rest ? `:${String(rest).padStart(2, '0')}` : ''}`;
}

/** "Asia/Baku" → "Baku". The city is what people recognise. */
export function zoneCityName(timeZone: string): string {
    return (timeZone.split('/').pop() ?? timeZone).replace(/_/g, ' ');
}
