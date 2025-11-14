import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Poll from '@/models/Poll';
import mongoose from 'mongoose';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    let parameters = await params;
    await connectDB();
    const pollId = parameters.id;

    console.log("API'ye Gelen Parametre (pollId):", pollId);

    if (!mongoose.Types.ObjectId.isValid(pollId)) {
        return NextResponse.json({ message: 'Geçersiz Anket ID formatı.' }, { status: 400 });
    }

    try {
        const poll = await Poll.findById(pollId);

        if (!poll) {
            return NextResponse.json({ message: 'Anket bulunamadı.' }, { status: 404 });
        }

        return NextResponse.json(poll, { status: 200 });

    } catch (error) {
        console.error("Anket çekme hatası:", error);
        return NextResponse.json(
            { message: 'Sunucu hatası: Anket bilgileri alınamadı.' },
            { status: 500 }
        );
    }
}