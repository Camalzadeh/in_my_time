import { Poll } from '@/models/Poll';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const validConfig = {
    targetDates: [new Date('2025-12-01T00:00:00Z')],
    dailyStartTime: '09:00',
    dailyEndTime: '17:00',
    slotDuration: 30,
};

const validPollData = {
    title: 'Project Meeting Poll',
    ownerId: 'user-humbat-123',
    config: validConfig,
    availableDates: [new Date('2025-12-01T09:00:00Z'), new Date('2025-12-01T09:30:00Z')],
    votes: [],
    status: 'open',
};

let mongod: MongoMemoryServer;

describe('Poll Model Schema Validation Tests', () => {

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();

        const uri = mongod.getUri();

        await mongoose.connect(uri);
    });

    afterAll(async () => {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
        if (mongod) {
            await mongod.stop();
        }
    });

    afterEach(async () => {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany({});
        }
    });

    it('should fail if a required field (title) is missing', async () => {
        const invalidData = { ...validPollData, title: undefined };
        const poll = new Poll(invalidData);

        await expect(poll.validate()).rejects.toThrow(mongoose.Error.ValidationError);
        await expect(poll.validate()).rejects.toThrow(/Path `title` is required/);
    });

    it('should fail if config is missing', async () => {
        const invalidData = { ...validPollData, config: undefined };
        const poll = new Poll(invalidData);

        await expect(poll.validate()).rejects.toThrow(mongoose.Error.ValidationError);
        await expect(poll.validate()).rejects.toThrow(/Path `config` is required/);
    });


    it('should fail if an embedded config field (slotDuration) is missing', async () => {
        const invalidConfig = { ...validConfig, slotDuration: undefined };
        const invalidData = { ...validPollData, config: invalidConfig };
        const poll = new Poll(invalidData);

        await expect(poll.validate()).rejects.toThrow(mongoose.Error.ValidationError);
        await expect(poll.validate()).rejects.toThrow(/Path `slotDuration` is required/);
    });


    it('should apply default values on creation', async () => {
        const minimalData = {
            title: 'Minimal Poll',
            ownerId: 'min-user',
            config: validConfig,
            availableDates: [new Date()],
        };
        const poll = new Poll(minimalData);

        expect(poll.votes).toEqual([]);
        expect(poll.status).toBe('open');
    });

    it('should fail if status is not one of the enum values', async () => {
        const invalidData = { ...validPollData, status: 'invalid-status' };
        const poll = new Poll(invalidData);

        await expect(poll.validate()).rejects.toThrow(mongoose.Error.ValidationError);
        await expect(poll.validate()).rejects.toThrow(/is not a valid enum value/);
    });


    it('should automatically set timestamps (createdAt, updatedAt) after saving', async () => {
        const poll = new Poll(validPollData);
        const savedPoll = await poll.save();

        expect(savedPoll.createdAt).toBeInstanceOf(Date);
        expect(savedPoll.updatedAt).toBeInstanceOf(Date);

        expect(savedPoll.createdAt.getTime()).toBeLessThanOrEqual(Date.now());
    });
});