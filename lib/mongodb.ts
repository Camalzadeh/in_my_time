// Importing this from a client component is a build error, not a runtime one.
// A constant used to be exported from models/Poll.ts, a form imported it, and
// mongoose came along for the ride — the page server-rendered fine and then
// threw `Cannot read properties of undefined (reading 'Poll')` on hydration.
import 'server-only';

import mongoose, { Mongoose } from 'mongoose';

// Both names are accepted: the code has always read MONGO_URI, while every
// workflow and most hosting providers hand over MONGODB_URI.
const MONGO_URI = process.env.MONGODB_URI ?? process.env.MONGO_URI;

declare global {
    var mongooseCache: {
        conn: Mongoose | null;
        promise: Promise<Mongoose> | null;
    };
}

// Every cold start is a fresh process, but a warm one serves many requests —
// so the connection has to be cached across them.
const cached = global.mongooseCache ?? (global.mongooseCache = { conn: null, promise: null });

export async function connectDB(): Promise<Mongoose> {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        if (!MONGO_URI) {
            throw new Error('MONGODB_URI environment variable is not defined!');
        }

        cached.promise = mongoose.connect(MONGO_URI, {
            bufferCommands: false,
            // Default is 30s. When the cluster is unreachable — paused free
            // tier, IP access list — that is 30 seconds of a spinning page and
            // of serverless execution time per request.
            serverSelectionTimeoutMS: 5000,
        });
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        // Keeping a rejected promise cached would make every later request in
        // this process fail the same way, even after the database came back.
        cached.promise = null;
        throw error;
    }
}
