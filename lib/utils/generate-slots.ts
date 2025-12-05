// generate-slots.ts

// timeToMinutes funksiyasını daxil etmək lazımdır (əgər ayrı fayldırsa)
import timeToMinutes from './time-to-minutes';
// Qeyd: Əgər hər ikisi eyni faylda olsaydı, import lazım olmazdı.

/**
 * Təqdim olunan tarix, başlanğıc vaxtı, son vaxtı və slot müddətinə əsaslanaraq vaxt slotlarının ISO stringlərini yaradır.
 * @param dateInput - Slotların yaradılacağı əsas tarix.
 * @param start - 'HH:MM' formatında başlanğıc vaxtı.
 * @param end - 'HH:MM' formatında son vaxtı (bu vaxta çatmamalıdır).
 * @param duration - Hər slotun dəqiqələrlə müddəti.
 * @returns ISO 8601 string formatında vaxt slotlarının massivi.
 */
const generateSlots = (dateInput: string | Date, start: string, end: string, duration: number): string[] => {
    const slots: string[] = [];

    // Başlanğıc və bitmə vaxtlarını dəqiqələrə çevir
    const startMins = timeToMinutes(start);
    const endMins = timeToMinutes(end);

    const baseDate = new Date(dateInput);

    // Başlanğıc dəqiqədən son dəqiqəyə qədər müəyyən edilmiş müddət qədər irəlilə
    for (let time = startMins; time < endMins; time += duration) {
        const h = Math.floor(time / 60); // Saat
        const m = time % 60; // Dəqiqə

        // Əsas tarixi istifadə edərək yeni vaxt slotu yaradır
        const slotDate = new Date(baseDate);
        slotDate.setHours(h, m, 0, 0); // Saat və dəqiqəni təyin edir

        slots.push(slotDate.toISOString());
    }
    return slots;
};

export default generateSlots;