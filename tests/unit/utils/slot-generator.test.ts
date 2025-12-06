import { generateAvailableSlots } from '@/lib/utils/slot-generator';
import { IPoll } from '@/types/Poll';

describe('generateAvailableSlots', () => {
    it('should generate slots for a single target date', () => {
        const config: IPoll['config'] = {
            targetDates: [new Date('2025-01-15T00:00:00Z')],
            dailyStartTime: '09:00',
            dailyEndTime: '12:00',
            slotDuration: 60,
        };

        const slots = generateAvailableSlots(config);

        expect(slots).toHaveLength(3);
        expect(slots[0].getHours()).toBe(9);
        expect(slots[0].getMinutes()).toBe(0);
        expect(slots[1].getHours()).toBe(10);
        expect(slots[1].getMinutes()).toBe(0);
        expect(slots[2].getHours()).toBe(11);
        expect(slots[2].getMinutes()).toBe(0);
    });

    it('should generate slots with 30-minute intervals', () => {
        const config: IPoll['config'] = {
            targetDates: [new Date('2025-01-15T00:00:00Z')],
            dailyStartTime: '10:00',
            dailyEndTime: '11:30',
            slotDuration: 30,
        };

        const slots = generateAvailableSlots(config);

        expect(slots).toHaveLength(3);
        expect(slots[0].getHours()).toBe(10);
        expect(slots[0].getMinutes()).toBe(0);
        expect(slots[1].getHours()).toBe(10);
        expect(slots[1].getMinutes()).toBe(30);
        expect(slots[2].getHours()).toBe(11);
        expect(slots[2].getMinutes()).toBe(0);
    });

    it('should generate slots for multiple target dates', () => {
        const config: IPoll['config'] = {
            targetDates: [
                new Date('2025-01-15T00:00:00Z'),
                new Date('2025-01-16T00:00:00Z'),
            ],
            dailyStartTime: '09:00',
            dailyEndTime: '10:00',
            slotDuration: 30,
        };

        const slots = generateAvailableSlots(config);

        expect(slots).toHaveLength(4);
        expect(slots[0].getDate()).toBe(15);
        expect(slots[0].getHours()).toBe(9);
        expect(slots[1].getDate()).toBe(15);
        expect(slots[1].getHours()).toBe(9);
        expect(slots[1].getMinutes()).toBe(30);
        expect(slots[2].getDate()).toBe(16);
        expect(slots[2].getHours()).toBe(9);
        expect(slots[3].getDate()).toBe(16);
        expect(slots[3].getHours()).toBe(9);
        expect(slots[3].getMinutes()).toBe(30);
    });

    it('should return empty array when end time equals start time', () => {
        const config: IPoll['config'] = {
            targetDates: [new Date('2025-01-15T00:00:00Z')],
            dailyStartTime: '10:00',
            dailyEndTime: '10:00',
            slotDuration: 30,
        };

        const slots = generateAvailableSlots(config);

        expect(slots).toHaveLength(0);
    });

    it('should return empty array when no target dates provided', () => {
        const config: IPoll['config'] = {
            targetDates: [],
            dailyStartTime: '09:00',
            dailyEndTime: '17:00',
            slotDuration: 60,
        };

        const slots = generateAvailableSlots(config);

        expect(slots).toHaveLength(0);
    });

    it('should handle start time with minutes', () => {
        const config: IPoll['config'] = {
            targetDates: [new Date('2025-01-15T00:00:00Z')],
            dailyStartTime: '09:30',
            dailyEndTime: '11:00',
            slotDuration: 30,
        };

        const slots = generateAvailableSlots(config);

        expect(slots).toHaveLength(3);
        expect(slots[0].getHours()).toBe(9);
        expect(slots[0].getMinutes()).toBe(30);
        expect(slots[1].getHours()).toBe(10);
        expect(slots[1].getMinutes()).toBe(0);
        expect(slots[2].getHours()).toBe(10);
        expect(slots[2].getMinutes()).toBe(30);
    });

    it('should not include slots that start at or after end time', () => {
        const config: IPoll['config'] = {
            targetDates: [new Date('2025-01-15T00:00:00Z')],
            dailyStartTime: '09:00',
            dailyEndTime: '09:45',
            slotDuration: 30,
        };

        const slots = generateAvailableSlots(config);

        expect(slots).toHaveLength(2);
        expect(slots[0].getHours()).toBe(9);
        expect(slots[0].getMinutes()).toBe(0);
        expect(slots[1].getHours()).toBe(9);
        expect(slots[1].getMinutes()).toBe(30);
    });

    it('should generate slots with 15-minute intervals', () => {
        const config: IPoll['config'] = {
            targetDates: [new Date('2025-01-15T00:00:00Z')],
            dailyStartTime: '14:00',
            dailyEndTime: '15:00',
            slotDuration: 15,
        };

        const slots = generateAvailableSlots(config);

        expect(slots).toHaveLength(4);
        expect(slots[0].getMinutes()).toBe(0);
        expect(slots[1].getMinutes()).toBe(15);
        expect(slots[2].getMinutes()).toBe(30);
        expect(slots[3].getMinutes()).toBe(45);
    });
});
