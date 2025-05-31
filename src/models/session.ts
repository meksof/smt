import { Schema, model, Document, Types } from 'mongoose';

export interface Session extends Document {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const sessionSchema = new Schema<Session>({
    _id: {
        type: Schema.Types.ObjectId,
        default: () => new Types.ObjectId(),
        required: true
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            delete ret.__v;
            return ret;
        }
    }
});

// Virtual populate for visits
sessionSchema.virtual('visits', {
    ref: 'Visit',
    localField: '_id',         // Session's _id field
    foreignField: 'sessionId'  // Visit's sessionId field that references Session
});

export const SessionModel = model<Session>('Session', sessionSchema);