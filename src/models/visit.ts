import { Schema, model, Document, Types, Model } from 'mongoose';
import { Event } from './event';
import { toObjectId } from '../utils';

export interface CreateVisitDto {
    sessionId?: string;
    createTimestamp: number; // client will send a timestamp in milliseconds
    referrer: string;
    page: string | null;
    utmSource: string | null;
}

export interface UpdateVisitDto {
    id: string;
    updateTimestamp: number; // client will send a timestamp in milliseconds
}

export interface Visit extends Document {
    sessionId?: Types.ObjectId;
    clientCreatedAt: Date; // time sent by the client
    clientUpdatedAt: Date; // time sent by the client
    referrer: string;
    page: string | null;
    utmSource: string | null;
    events?: Event[];
    createdAt: Date; // time created by the server
    updatedAt: Date; // time updated by the server
    // Note: duration is stored in the database, it is calculated on the fly
    duration: number; // duration in milliseconds
    updateDuration(updateDate: Date): Promise<Visit>;
}

const visitSchema = new Schema<Visit>({
    sessionId: {
        type: Schema.Types.ObjectId,
        ref: 'Session',
        index: true,
        sparse: true,
        validate: {
            validator: function (v: Types.ObjectId) {
                return Types.ObjectId.isValid(v);
            },
            message: 'Invalid ObjectId'
        }
    },
    clientCreatedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    clientUpdatedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    referrer: {
        type: String,
        required: true,
        default: '(direct)'
    },
    page: {
        type: String,
        default: null
    },
    utmSource: {
        type: String,
        default: null
    },
    duration: {
        type: Number,
        default: 0
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

// Indexes
visitSchema.index({ clientCreatedAt: 1 });
visitSchema.index({ clientUpdatedAt: 1 });
visitSchema.index({ referrer: 1 });
visitSchema.index({ page: 1 });
visitSchema.index({ utmSource: 1 }, { sparse: true });

// Virtual populate for events
visitSchema.virtual('events', {
    ref: 'Event',
    localField: '_id',
    foreignField: 'visit'
});


// Instance methods
visitSchema.methods.updateDuration = async function (updateDate: Date) {
    this.duration = updateDate.getTime() - this.clientCreatedAt.getTime();
    return await this.save();
};

// Static methods interface
interface VisitModel extends Model<Visit> {
    findBySessionId(sessionId: string | Types.ObjectId): Promise<Visit[]>;
}

// Static methods
visitSchema.statics.findBySessionId = async function (sessionId: string | Types.ObjectId): Promise<Visit[]> {
    if (typeof sessionId === 'string') {
        sessionId = toObjectId(sessionId);
    }
    return this.find({ sessionId })
        .sort({ clientCreatedAt: -1 })
        .populate('events');
};

// Export model with static methods
export const VisitModel = model<Visit, VisitModel>('Visit', visitSchema);
