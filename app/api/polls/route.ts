import { NextResponse } from 'next/server';

import { connectDB } from '@/lib/mongodb';
import { Poll } from '@/models/Poll';
import { createPollSchema, firstIssue } from '@/lib/validation';
import { createToken, hashToken, ownerCookieName, attachToken } from '@/lib/auth/tokens';

export async function POST(request: Request) {
    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ message: 'Request body is not valid JSON.' }, { status: 400 });
    }

    const parsed = createPollSchema.safeParse(body);

    if (!parsed.success) {
        // This used to return 500 for a malformed date, so the user saw
        // "Server error" for their own typo.
        return NextResponse.json({ message: firstIssue(parsed.error) }, { status: 400 });
    }

    const { title, description, config } = parsed.data;

    try {
        await connectDB();

        // Proof of ownership: the hash is stored, the raw token goes back as an
        // httpOnly cookie.
        const ownerToken = createToken();

        const poll = await Poll.create({
            title,
            description,
            ownerTokenHash: hashToken(ownerToken),
            config,
        });

        const pollId = poll._id.toString();

        const response = NextResponse.json(
            { message: 'Poll created successfully.', pollId },
            { status: 201 },
        );

        attachToken(response, ownerCookieName(pollId), ownerToken);

        return response;
    } catch (error) {
        console.error('[polls] create failed', error);
        return NextResponse.json({ message: 'Could not create poll.' }, { status: 500 });
    }
}
