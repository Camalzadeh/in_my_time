import mongoose, {Schema, Model} from 'mongoose';
import {IPoll, IVote} from '@/types/Poll';

const VoteSchema: Schema = new Schema<IVote>({
    voterName: {type: String, required: true},
    availableSlots: [{type: Date, required: true}],
}, {_id: false});

const PollSchema: Schema = new Schema<IPoll>({
    title: {type: String, required: true, trim: true},
    description: {type: String, default: ''},
    ownerId: {type: String, required: true},
    availableDates: [{type: Date, required: true}],
    votes: [VoteSchema], // Array of Vote sub-documents
    status: {type: String, enum: ['open', 'closed'], default: 'open'},
}, {
    timestamps: true
});


const Poll: Model<IPoll> = (mongoose.models.Poll ||
    mongoose.model<IPoll>('Poll', PollSchema));

export default Poll;