export type TimeRange = {
    start: Date;
    end: Date;
  };
  
  export function generateTimeSlots(
    { start, end }: TimeRange,
    stepMinutes: number
  ): Date[] {
    const slots: Date[] = [];
    const current = new Date(start);
  
    while (current < end) {
      slots.push(new Date(current));
      current.setMinutes(current.getMinutes() + stepMinutes);
    }
  
    return slots;
  }
  
  export function formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  