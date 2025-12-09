// lib/poll-slots.ts

/**
 * Build an array of ISO strings representing all time slots
 * across all target dates, given daily start/end times and slot duration.
 */
export function buildSelectedSlots(
    targetDates: string[],
    dailyStartTime: string,
    dailyEndTime: string,
    slotDurationMinutes: number
  ): string[] {
    const selectedSlots: string[] = [];
  
    targetDates.forEach((date) => {
      const start = new Date(`${date}T${dailyStartTime}`);
      const end = new Date(`${date}T${dailyEndTime}`);
  
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
        return;
      }
  
      for (
        let current = new Date(start);
        current < end;
        current = new Date(current.getTime() + slotDurationMinutes * 60000)
      ) {
        selectedSlots.push(current.toISOString());
      }
    });
  
    return selectedSlots;
  }
  