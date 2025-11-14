export interface IVote {
    voterName: string;
    availableSlots: Date[];
}

import {Document} from 'mongoose';

export interface IPoll extends Document {
    title: string;
    description: string;
    ownerId: string;
    availableDates: Date[];
    votes: IVote[];
    status: 'open' | 'closed';
}