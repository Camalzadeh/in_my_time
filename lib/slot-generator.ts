import { IPoll } from '@/types/Poll';
import { addMinutes, setHours, setMinutes, parseISO, isSameDay, addDays } from 'date-fns';

export function generateAvailableSlots(config: IPoll['config']): Date[] {
    const { targetDates, dailyStartTime, dailyEndTime, slotDuration } = config;
    const allSlots: Date[] = [];

    const [startHour, startMinute] = dailyStartTime.split(':').map(Number);
    const [endHour, endMinute] = dailyEndTime.split(':').map(Number);

    for (const targetDate of targetDates) {
        let currentSlot = setMinutes(setHours(targetDate, startHour), startMinute);

        const endTime = setMinutes(setHours(targetDate, endHour), endMinute);

        while (currentSlot.getTime() < endTime.getTime()) {
            allSlots.push(currentSlot);

            currentSlot = addMinutes(currentSlot, slotDuration);
        }
    }

    return allSlots;
}