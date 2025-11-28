import { addMinutes, setHours, setMinutes, isValid } from 'date-fns';
import { IPoll } from '@/types/Poll';

export function generateAvailableSlots(config: IPoll['config']): Date[] {
    const { targetDates, dailyStartTime, dailyEndTime, slotDuration } = config;
    const allSlots: Date[] = [];

    const [startHour, startMinute] = dailyStartTime.split(':').map(Number);
    const [endHour, endMinute] = dailyEndTime.split(':').map(Number);

    for (const date of targetDates) {
        // ensure date is a valid Date
        const base = new Date(date);
        if (!isValid(base)) {
            console.error("Invalid target date:", date);
            continue;
        }

        let current = setMinutes(setHours(base, startHour), startMinute);
        const end = setMinutes(setHours(base, endHour), endMinute);

        while (current < end) {
            allSlots.push(new Date(current));  // clone
            current = addMinutes(current, slotDuration);
        }
    }

    return allSlots;
}
