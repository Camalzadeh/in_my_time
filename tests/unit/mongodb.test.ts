const mockConnect = jest.fn();

jest.mock('mongoose', () => ({
    connect: mockConnect,
}));

describe('connectDB', () => {
    const originalEnv = process.env;
    const originalGlobal = global.mongoose;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();

        // Reset global.mongoose before each test
        global.mongoose = { conn: null, promise: null };

        // Reset environment
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
        global.mongoose = originalGlobal;
    });

    it('should return cached connection if it exists', async () => {
        const mockConn = { connection: 'cached' };
        global.mongoose = { conn: mockConn as unknown as null, promise: null };

        process.env.MONGO_URI = 'mongodb://localhost:27017/test';

        const { connectDB } = await import('@/lib/mongodb');
        const result = await connectDB();

        expect(result).toBe(mockConn);
        expect(mockConnect).not.toHaveBeenCalled();
    });

    it('should throw error if MONGO_URI is not defined', async () => {
        delete process.env.MONGO_URI;

        const { connectDB } = await import('@/lib/mongodb');

        await expect(connectDB()).rejects.toThrow('MONGO_URI environment variable is not defined!');
    });

    it('should create new connection when cache is empty', async () => {
        const mockMongoose = { connection: 'new' };
        mockConnect.mockResolvedValueOnce(mockMongoose);

        process.env.MONGO_URI = 'mongodb://localhost:27017/test';

        const { connectDB } = await import('@/lib/mongodb');
        const result = await connectDB();

        expect(mockConnect).toHaveBeenCalledWith(
            'mongodb://localhost:27017/test',
            { bufferCommands: false }
        );
        expect(result).toBe(mockMongoose);
    });

    it('should reuse existing promise if connection is in progress', async () => {
        const mockMongoose = { connection: 'shared' };
        mockConnect.mockResolvedValueOnce(mockMongoose);

        process.env.MONGO_URI = 'mongodb://localhost:27017/test';

        const { connectDB } = await import('@/lib/mongodb');

        // Call connectDB twice concurrently
        const [result1, result2] = await Promise.all([connectDB(), connectDB()]);

        // Should only call mongoose.connect once
        expect(mockConnect).toHaveBeenCalledTimes(1);
        expect(result1).toBe(result2);
    });

    it('should reset promise on connection error', async () => {
        const connectionError = new Error('Connection failed');
        mockConnect.mockRejectedValueOnce(connectionError);

        process.env.MONGO_URI = 'mongodb://localhost:27017/test';

        const { connectDB } = await import('@/lib/mongodb');

        await expect(connectDB()).rejects.toThrow('Connection failed');

        // After error, promise should be reset to null
        expect(global.mongoose.promise).toBeNull();
    });
});
