import { Document } from 'mongoose';

export interface IVote {
    tempVoterId: string;
    voterName: string;
    voterColor?: string;

    selectedSlots: Date[];

    votedAt: Date;
}

export interface IPoll extends Document {
    _id: string;

    title: string;
    description?: string;
    ownerId: string;


    config: {
        targetDates: Date[];

        dailyStartTime: string;
        dailyEndTime: string;
        slotDuration: number;
    };

    availableDates: Date[];

    votes: IVote[];

    status: 'open' | 'closed' | 'finalized';
    finalTime?: Date;

    createdAt: Date;
    updatedAt: Date;
}