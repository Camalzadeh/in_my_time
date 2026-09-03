import mongoose from 'mongoose';

import { Poll } from '@/models/Poll';
import { connectDB } from '@/lib/mongodb';

// These tests run against a real MongoDB — the one beside the app in
// development, and a service container in CI. tests/setup-env.js points
// MONGODB_URI at a scratch database so the development data is never touched.
//
// Every "integration" test used to mock the model away, which meant none of
// them could catch a race or a missing authorization check. The interesting
// behaviour only exists when the database is real.

export function setUpTestDatabase() {
    beforeAll(async () => {
        await connectDB();
    });

    afterEach(async () => {
        await Poll.deleteMany({});
    });

    afterAll(async () => {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    });
}

export const validConfig = {
    targetDates: ['2027-03-10', '2027-03-11'],
    dailyStartTime: '09:00',
    dailyEndTime: '12:00',
    slotDuration: 60,
    timezone: 'Asia/Baku',
};

/** 09:00 on the first day, in Baku (UTC+4). */
export const FIRST_SLOT = '2027-03-10T05:00:00.000Z';
export const SECOND_SLOT = '2027-03-10T06:00:00.000Z';
