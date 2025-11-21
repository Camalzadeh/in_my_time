import mongoose, { Schema, Document, Model } from 'mongoose';
import {IPoll, IVote} from "@/types/Poll";

const VoteSchema: Schema = new Schema<IVote>({
    tempVoterId: { type: String, required: true },
    voterName: { type: String, required: true },
    voterColor: { type: String, required: false },
    selectedSlots: { type: [Date], required: true },

    votedAt: { type: Date, default: Date.now },
}, { _id: false });

const ConfigSchema: Schema = new Schema({
    targetDates: { type: [Date], required: true },

    dailyStartTime: { type: String, required: true },
    dailyEndTime: { type: String, required: true },

    slotDuration: { type: Number, required: true },
}, { _id: false });

const PollSchema: Schema<IPoll> = new Schema<IPoll>({
    title: { type: String, required: true },
    description: { type: String, required: false },
    ownerId: { type: String, required: true, index: true },

    config: { type: ConfigSchema, required: true },

    availableDates: { type: [Date], required: true },

    votes: { type: [VoteSchema], required: true, default: [] },

    status: {
        type: String,
        enum: ['open', 'closed', 'finalized'],
        default: 'open',
        required: true
    },
    finalTime: { type: Date, required: false },

}, {
    timestamps: true
});

const Poll: Model<IPoll> = mongoose.models.Poll || mongoose.model<IPoll>('Poll', PollSchema);

export {
    Poll,
};