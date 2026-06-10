import { Schema, model, Document, Types } from 'mongoose';
import { Visit } from './visit';

export interface Session extends Document {
    _id: Types.ObjectId;
    userAgent?: string;
    ip?: string;
    createdAt: Date;
    updatedAt: Date;
    // Virtual fields
    visits?: Visit[];
    durationInMilliSec?: number; // duration in seconds
    __v?: number;
}

const sessionSchema = new Schema<Session>({
    _id: {
        type: Schema.Types.ObjectId,
        default: () => new Types.ObjectId(),
        required: true
    },
    userAgent: {
        type: String,
        required: false,
        trim: true
    },
    ip: {
        type: String,
        required: false,
        trim: true
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            if (ret && typeof ret === 'object' && '__v' in ret) {
                delete ret.__v;
            }
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

sessionSchema.virtual('durationInMilliSec', {
    ref: 'Visit',
    localField: '_id',
    foreignField: 'sessionId',
    justOne: false,
    get: function() {
        return this.visits?.reduce((sum: number, visit: Visit) => sum + visit.durationInMilliSec, 0) || 0;
    }
});

export const SessionModel = model<Session>('Session', sessionSchema);
