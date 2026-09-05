'use client';

import { useCallback, useEffect, useState } from 'react';

import { guessTimeZone, isValidTimeZone } from '@/lib/time/zone';

const STORAGE_KEY = 'inmytime_display_tz';

/** "auto" means whatever zone this device is in, which is the default. */
export type ZonePreference = 'auto' | string;

interface DisplayTimezone {
    /** The zone the poll should be drawn in right now. */
    timezone: string;
    preference: ZonePreference;
    /** False until the browser has been read, so the first render matches the server's. */
    isResolved: boolean;
    setPreference: (preference: ZonePreference) => void;
}

/**
 * Which zone to show a poll in.
 *
 * The server has no idea where the viewer is, so the first render uses the
 * poll's own zone and the real one is swapped in after mount. Rendering the
 * device zone straight away would mean the server and the browser disagreed on
 * every label, which React reports as a hydration mismatch.
 *
 * The preference is stored per device rather than per poll, and "auto" is kept
 * as "auto" rather than being resolved to a zone name: someone who sets it
 * while travelling should still see local times when they land.
 */
export function useDisplayTimezone(pollTimezone: string): DisplayTimezone {
    const [preference, setStoredPreference] = useState<ZonePreference>('auto');
    const [deviceZone, setDeviceZone] = useState(pollTimezone);
    const [isResolved, setResolved] = useState(false);

    useEffect(() => {
        setDeviceZone(guessTimeZone());

        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored && stored !== 'auto' && isValidTimeZone(stored)) {
                setStoredPreference(stored);
            }
        } catch {
            // Private mode, or storage disabled. "auto" is a fine answer.
        }

        setResolved(true);
    }, []);

    const setPreference = useCallback((next: ZonePreference) => {
        setStoredPreference(next);

        try {
            if (next === 'auto') localStorage.removeItem(STORAGE_KEY);
            else localStorage.setItem(STORAGE_KEY, next);
        } catch {
            // The choice still applies for this visit.
        }
    }, []);

    return {
        timezone: preference === 'auto' ? deviceZone : preference,
        preference,
        isResolved,
        setPreference,
    };
}
