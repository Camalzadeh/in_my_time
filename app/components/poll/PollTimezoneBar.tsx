'use client';

import { useMemo } from 'react';
import { Globe } from 'lucide-react';

import { zoneCityName, zoneOffsetLabel } from '@/lib/time/zone';
import type { ZonePreference } from '@/lib/hooks/use-display-timezone';

interface Props {
    /** The zone the grid is currently drawn in. */
    displayTimezone: string;
    /** The zone the poll was written in. */
    pollTimezone: string;
    preference: ZonePreference;
    onChange: (preference: ZonePreference) => void;
}

// Says which clock the grid is showing, and lets the viewer change it.
//
// Without this the grid is ambiguous in the one way that matters. A poll
// written in Berlin used to be shown to everybody in Berlin time, so a
// participant in Baku read "14:00" and had to do the conversion themselves —
// exactly the arithmetic the tool exists to remove. Every viewer now gets their
// own clock by default, and the poll's own zone stays one click away for anyone
// coordinating with the person who made it.

export default function PollTimezoneBar({
    displayTimezone,
    pollTimezone,
    preference,
    onChange,
}: Props) {
    const zones = useMemo(() => {
        try {
            return Intl.supportedValuesOf('timeZone');
        } catch {
            // Older engines do not have it; the two options that matter are
            // listed separately anyway.
            return [displayTimezone, pollTimezone];
        }
    }, [displayTimezone, pollTimezone]);

    const deviceZone = preference === 'auto' ? displayTimezone : null;
    const isPollZone = displayTimezone === pollTimezone;

    return (
        <div className="flex flex-col gap-2 border-b border-border bg-muted/30 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4">
            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <Globe className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>
                    Times shown in{' '}
                    <span className="font-semibold text-foreground">
                        {zoneCityName(displayTimezone)} ({zoneOffsetLabel(displayTimezone)})
                    </span>
                    {deviceZone && <span> — your time zone</span>}
                    {!isPollZone && (
                        <>
                            {'. Written in '}
                            <span className="font-medium text-foreground">
                                {zoneCityName(pollTimezone)} ({zoneOffsetLabel(pollTimezone)})
                            </span>
                            {'.'}
                        </>
                    )}
                </span>
            </p>

            <label className="flex shrink-0 items-center gap-2 text-xs">
                <span className="sr-only sm:not-sr-only sm:text-muted-foreground">Show in</span>
                <select
                    value={preference}
                    onChange={(event) => onChange(event.target.value)}
                    className="h-9 max-w-[13rem] rounded-lg border border-border bg-background px-2 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-none"
                    aria-label="Time zone to show these times in"
                >
                    <option value="auto">My time zone</option>
                    <option value={pollTimezone}>
                        Poll&apos;s zone — {zoneCityName(pollTimezone)}
                    </option>
                    <optgroup label="All time zones">
                        {zones.map((zone) => (
                            <option key={zone} value={zone}>
                                {zone.replace(/_/g, ' ')}
                            </option>
                        ))}
                    </optgroup>
                </select>
            </label>
        </div>
    );
}
