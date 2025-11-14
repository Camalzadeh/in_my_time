// app/api/polls/route.ts (Güncellenmiş POST fonksiyonu)

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Poll from '@/models/Poll';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("2. Gelen Veri (Body):", body);

        await connectDB();
        console.log("3. MongoDB bağlantısı başarılı.");

        const { title, description, availableDates, ownerId } = body; // ownerId'yi de almalısınız!

        if (!title || !availableDates || availableDates.length === 0 || !ownerId) {
            return NextResponse.json(
                { message: 'Başlık, tarihler ve sahip kimliği (ownerId) zorunludur.' },
                { status: 400 }
            );
        }

        const newPoll = await Poll.create({
            title,
            description: description || '',
            availableDates,
            ownerId
        });

        console.log("4. Veri başarıyla kaydedildi.");

        return NextResponse.json(
            {
                message: 'Anket başarıyla oluşturuldu.',
                pollId: newPoll._id,
                shareUrl: `/poll/${newPoll._id}`
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("KRİTİK SUNUCU HATASI:", error);
        return NextResponse.json(
            { message: 'Sunucu hatası: Anket oluşturulamadı.', detail: (error as Error).message },
            { status: 500 }
        );
    }
}