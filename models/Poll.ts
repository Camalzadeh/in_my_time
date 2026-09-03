import mongoose, { Schema, Model, HydratedDocument } from 'mongoose';
import type { IPoll, IVote, IPollConfig } from '@/types/Poll';

// Limits. These must agree with the zod schemas in lib/validation.ts — zod is
// what gives the user a readable message, these are the last line of defence.
export const LIMITS = {
    TITLE_MAX: 200,
    DESCRIPTION_MAX: 2000,
    DATES_MAX: 60,
    VOTER_NAME_MAX: 60,
    SLOTS_PER_VOTE_MAX: 2000,
    SLOT_DURATION_MIN: 5,
    SLOT_DURATION_MAX: 480,
} as const;

const VoteSchema = new Schema<IVote>(
    {
        voterId: { type: String, required: true },
        voterName: { type: String, required: true, trim: true, maxlength: LIMITS.VOTER_NAME_MAX },
        // A secret. lib/data/serialize.ts is what keeps it off the wire.
        tokenHash: { type: String, required: true },
        selectedSlots: { type: [Date], required: true, default: [] },
        votedAt: { type: Date, default: Date.now },
    },
    { _id: false },
);

const ConfigSchema = new Schema<IPollConfig>(
    {
        // A day, not an instant: "2026-09-10". The old model stored these as
        // Dates, which conflated "the 10th" with "midnight on the 10th, in
        // whichever zone happened to be running the code".
        //
        // `required` alone is not enough: mongoose counts an empty array as
        // present, so a poll with no days at all would save.
        targetDates: {
            type: [String],
            required: true,
            validate: {
                validator: (value: string[]) => Array.isArray(value) && value.length > 0,
                message: 'A poll needs at least one day.',
            },
        },

        dailyStartTime: { type: String, required: true },
        dailyEndTime: { type: String, required: true },
        slotDuration: {
            type: Number,
            required: true,
            min: LIMITS.SLOT_DURATION_MIN,
            max: LIMITS.SLOT_DURATION_MAX,
        },

        // Every slot's meaning depends on this. Without it "14:00" is an
        // incomplete sentence, which was the old model's central flaw.
        timezone: { type: String, required: true },
    },
    { _id: false },
);

const PollSchema = new Schema<IPoll>(
    {
        title: { type: String, required: true, trim: true, maxlength: LIMITS.TITLE_MAX },
        description: { type: String, trim: true, maxlength: LIMITS.DESCRIPTION_MAX, default: '' },

        // Proof of ownership. The old model had `ownerId`, and it appeared in
        // the poll's public JSON — so anyone with the link could read it and
        // claim to be the owner. Only the hash lives here now; the raw token is
        // in an httpOnly cookie.
        ownerTokenHash: { type: String, required: true },

        config: { type: ConfigSchema, required: true },
        votes: { type: [VoteSchema], required: true, default: [] },

        status: {
            type: String,
            enum: ['open', 'finalized'],
            default: 'open',
            required: true,
        },
        finalTime: { type: Date },
    },
    { timestamps: true },
);

// There is deliberately no index on `votes.voterId`: every query already
// selects a single document by `_id`, and the array condition is then checked
// inside that document.

export type PollDocument = HydratedDocument<IPoll>;

// In dev the module reloads, and mongoose throws if the same model is
// registered twice.
export const Poll: Model<IPoll> =
    (mongoose.models.Poll as Model<IPoll>) || mongoose.model<IPoll>('Poll', PollSchema);
