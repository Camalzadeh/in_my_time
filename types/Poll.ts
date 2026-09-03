// The shapes as stored. For what reaches the browser see lib/data/serialize.ts —
// those are deliberately different, because the secrets stay on the server.

export interface IVote {
    /** The browser's random localStorage id. Not a secret; anyone with the link sees it. */
    voterId: string;
    voterName: string;
    /** SHA-256 of the token that permits editing this vote. Never sent to the browser. */
    tokenHash: string;
    /** UTC instants, derived from wall-clock times in the poll's zone. */
    selectedSlots: Date[];
    votedAt: Date;
}

export interface IPollConfig {
    /** Calendar days, "YYYY-MM-DD". Days, not instants. */
    targetDates: string[];
    /** Wall-clock times, "HH:mm", in the zone below. */
    dailyStartTime: string;
    dailyEndTime: string;
    /** Minutes. */
    slotDuration: number;
    /** IANA zone name, e.g. "Asia/Baku". Every slot's meaning depends on it. */
    timezone: string;
}

export interface IPoll {
    _id: string;

    title: string;
    description?: string;

    /** SHA-256 of the token that proves ownership. Never sent to the browser. */
    ownerTokenHash: string;

    config: IPollConfig;
    votes: IVote[];

    status: 'open' | 'finalized';
    /** The slot the owner settled on when closing the poll. */
    finalTime?: Date;

    createdAt: Date;
    updatedAt: Date;
}
