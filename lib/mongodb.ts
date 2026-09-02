import mongoose, { Mongoose } from 'mongoose';

// Both names are accepted: the code has always read MONGO_URI, while every
// workflow and most hosting providers hand over MONGODB_URI.
const MONGO_URI = process.env.MONGODB_URI ?? process.env.MONGO_URI;

declare global {
    var mongoose: {
        conn: Mongoose | null;
        promise: Promise<Mongoose> | null;
    };
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
    if (cached.conn) {
        console.log('MongoDB: Returning from cache.');
        return cached.conn;
    }

    if (!cached.promise) {
        if (!MONGO_URI) {
            throw new Error('MONGODB_URI environment variable is not defined!');
        }

        const opts = {
            bufferCommands: false,
            // Default is 30s. When the cluster is unreachable — paused free
            // tier, IP access list — that is 30 seconds of a spinning page and
            // of serverless execution time per request.
            serverSelectionTimeoutMS: 5000,
        };

        cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
            return mongoose;
        });
        console.log('MongoDB: Creating new connection...');
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (e) {
        cached.promise = null;
        throw e;
    }
}
