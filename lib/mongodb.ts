// frontend/lib/mongodb.ts

import mongoose, { Mongoose } from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

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
        console.log('MongoDB: Önbellekten dönülüyor.');
        return cached.conn;
    }

    if (!cached.promise) {
        if (!MONGO_URI) {
            throw new Error('MONGO_URI ortam değişkeni tanımlı değil!');
        }

        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
            return mongoose;
        });
        console.log('MongoDB: Yeni bağlantı oluşturuluyor...');
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (e) {
        cached.promise = null;
        throw e;
    }
}