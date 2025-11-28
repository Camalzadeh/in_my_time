// components/RealtimeOrders.tsx (veya app/page.tsx)

'use client';

import React, { useState } from 'react';
import { configureAbly, useChannel } from '@ably-labs/react-hooks';
import Ably from "ably";

// MongoDB-dən gələn məlumatın tipini müəyyənləşdirin (bu, sizin sənədinizin quruluşuna uyğun olmalıdır)
interface MongoDocument {
    _id: string;
    test_ad?: string;
    status?: string;
    // [key: string]: any;
}

// Ably mesajının payload-u (Triggerdən gələn data)
// interface AblyMessageData {
//     operation: string; // Varsa, əlavə tip
//     data: MongoDocument; // Əsas sənəd datası
// }

// API route-a yönəldirik
configureAbly({ authUrl: '/api/ably' });

export default function RealtimeOrders() {
    const [updates, setUpdates] = useState<MongoDocument[]>([]);

    // useChannel hook-unu istifadə edərək kanala abunə oluruq
    // TypeScript: message obyektini Ably.Message olaraq tipləndiririk
    const [] = useChannel("mongo-data-channel", (message: Ably.Message) => {

        // Məlumatı AblyMessageData tipinə çeviririk (əgər Trigger kodunuz eyni payload-u göndərirsə)
        const newDoc = message.data as MongoDocument;

        // Gələn yeni datanı siyahının başına əlavə edirik
        setUpdates((prev) => [newDoc, ...prev]);
    });

    return (
        <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
            <h1>📦 Canlı MongoDB İzləmə (TypeScript)</h1>

            <div style={{ display: 'grid', gap: '10px', marginTop: '20px' }}>
                {updates.map((item, index) => (
                    <div key={item._id || index} style={{
                        border: '1px solid #ddd',
                        padding: '15px',
                        borderRadius: '8px',
                        backgroundColor: '#f9f9f9',
                    }}>
                        <strong>ID:</strong> {item._id} <br />
                        <strong>Status:</strong> {item.status || 'Müəyyən edilməyib'}
                        <pre style={{ overflowX: 'auto' }}>{JSON.stringify(item, null, 2)}</pre>
                    </div>
                ))}
            </div>

            {updates.length === 0 && <p>Hələ ki, yeni dəyişiklik yoxdur. MongoDB-də bir sənəd əlavə edin.</p>}
        </div>
    );
}
// import { PollContent } from '../../components/poll/PollContent';
// import { getPollData } from '@/lib/data-fetcher';
//
//
//
// interface PollPageProps {
//     params: Promise<{
//         id: string;
//     }>;
// }
//
// export default async function PollPage({ params }: PollPageProps) {
//     const parameters =  await params;
//     const pollId = parameters.id;
//
//     let pollData;
//     try {
//         pollData = await getPollData(pollId);
//     } catch (error) {
//         console.error("Error fetching data from API:", error);
//         return <div className="text-center p-20 text-red-500">Server error occurred while fetching data.</div>;
//     }
//
//     return (
//         <PollContent pollData={pollData} pollId={pollId} />
//     );
// }