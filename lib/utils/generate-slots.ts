import timeToMinutes from './time-to-minutes';

const generateSlots = (dateInput: string | Date, start: string, end: string, duration: number): string[] => {
    const slots: string[] = [];

    const startMins = timeToMinutes(start);
    const endMins = timeToMinutes(end);

    const baseDate = new Date(dateInput);

    for (let time = startMins; time < endMins; time += duration) {
        const h = Math.floor(time / 60);
        const m = time % 60;

        const slotDate = new Date(baseDate);
        slotDate.setHours(h, m, 0, 0);

        slots.push(slotDate.toISOString());
    }
    return slots;
};

export default generateSlots;