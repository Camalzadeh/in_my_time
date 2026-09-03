'use client';

import { useEffect, useMemo } from 'react';
import * as Ably from 'ably';
import { AblyProvider, ChannelProvider, useChannel, useConnectionStateListener } from 'ably/react';

import { pollChannelName, POLL_EVENT, isPollEvent, type PollEvent } from '@/lib/poll-state';

// The realtime subscription.
//
// This used `@ably-labs/react-hooks`, which is deprecated and conflicts with
// React 19 — the reason every install in this project needed
// `--legacy-peer-deps`. The same hooks now ship inside the `ably` package
// itself (`ably/react`), which was already a dependency.
//
// Mounted only when realtime is configured: with no Ably key the server sends
// `realtimeEnabled: false` and the site works without it.

export type RealtimeStatus = 'connecting' | 'live' | 'offline';

interface Props {
    pollId: string;
    onEvent: (event: PollEvent) => void;
    onStatusChange?: (status: RealtimeStatus) => void;
}

function Subscriber({ pollId, onEvent, onStatusChange }: Props) {
    useChannel(pollChannelName(pollId), POLL_EVENT, (message) => {
        // Anything off the channel is untrusted until its shape checks out.
        if (isPollEvent(message.data)) onEvent(message.data);
    });

    useConnectionStateListener((stateChange) => {
        if (!onStatusChange) return;

        if (stateChange.current === 'connected') {
            onStatusChange('live');
        } else if (stateChange.current === 'connecting' || stateChange.current === 'initialized') {
            onStatusChange('connecting');
        } else {
            onStatusChange('offline');
        }
    });

    return null;
}

export default function PollRealtimeBridge(props: Props) {
    const client = useMemo(
        () =>
            new Ably.Realtime({
                authUrl: '/api/ably',
                // Try to replay messages missed while the connection was down.
                recover: (_lastConnectionDetails, callback) => callback(true),
            }),
        [],
    );

    useEffect(() => () => client.close(), [client]);

    return (
        <AblyProvider client={client}>
            <ChannelProvider channelName={pollChannelName(props.pollId)}>
                <Subscriber {...props} />
            </ChannelProvider>
        </AblyProvider>
    );
}
