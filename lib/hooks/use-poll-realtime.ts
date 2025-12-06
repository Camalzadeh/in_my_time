// hooks/use-poll-realtime.ts
'use client';

import { useState } from 'react';
import { useChannel } from '@ably-labs/react-hooks';
import Ably from "ably";
import type { IPoll } from '@/types/Poll';

const usePollRealtime = (pollId: string, initialPollData: IPoll) => {
    const [poll, setPoll] = useState<IPoll>(initialPollData);
    const channelName = `poll-${pollId}-updates`;

    const [channel] = useChannel(channelName, (message: Ably.Message) => {
        const newPollData = message.data as IPoll;
        console.log("🔥 Canlı Yenilənmə:", newPollData);
        setPoll(newPollData);
    });

    return { poll, channel };
};

export default usePollRealtime;