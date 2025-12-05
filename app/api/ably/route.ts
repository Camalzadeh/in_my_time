import {NextResponse } from 'next/server';
import Ably from 'ably';

export const dynamic = 'force-dynamic';

export async function GET() {
    if (!process.env.ABLY_API_KEY) {
        return NextResponse.json({ error: 'ABLY_API_KEY is not set' }, { status: 500 });
    }

    try {
        const client = new Ably.Rest(process.env.ABLY_API_KEY);

        const tokenRequestData = await client.auth.createTokenRequest({
            clientId: 'nextjs-typescript-client',
        });

        return NextResponse.json(tokenRequestData);
    } catch (error) {
        console.error("Ably Token Yaratma Xətası:", error);
        return NextResponse.json({ error: 'Failed to create Ably token' }, { status: 500 });
    }
}