export function generateTimeSlots(
    range: { start: Date; end: Date },
    durationMinutes: number
  ): Date[] {
    const { start, end } = range;
  
    const slots: Date[] = [];
    const current = new Date(start);
  
    while (current < end) {
      slots.push(new Date(current));
      current.setMinutes(current.getMinutes() + durationMinutes);
    }
  
    return slots;
  }
  
  // Format a Date object into HH:mm
  export function formatTime(date: Date): string {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
  