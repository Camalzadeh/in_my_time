import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Poll } from '@/models/Poll';
import { generateAvailableSlots } from '@/lib/slot-generator';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("2. Incoming Data (Body):", body);

        await connectDB();
        console.log("3. MongoDB connection successful.");

        // Client'tan artık 'availableDates' beklemiyoruz, 'config' bekliyoruz.
        const { title, description, ownerId, config } = body;

        // Yeni validasyon: Config zorunlu
        if (!title || !ownerId || !config) {
            return NextResponse.json(
                { message: 'Title, owner ID, and config are required.' },
                { status: 400 }
            );
        }

        // Backend tarafında slotları hesapla
        const availableDates = generateAvailableSlots(config);

        const newPoll = await Poll.create({
            title,
            description: description || '',
            ownerId,
            config,           // UI'ı tekrar çizmek için ayarları sakla
            availableDates    // Oylama mantığı için hesaplanan tarihleri sakla
        });

        console.log("4. Data saved successfully.");

        return NextResponse.json(
            {
                message: 'Poll created successfully.',
                pollId: newPoll._id,
                shareUrl: `/poll/${newPoll._id}`
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("CRITICAL SERVER ERROR:", error);
        return NextResponse.json(
            { message: 'Server error: Could not create poll.', detail: (error as Error).message },
            { status: 500 }
        );
    }
}