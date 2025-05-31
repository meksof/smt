import { Schema, model, Document, Types, Model } from 'mongoose';
import { Event } from './event';
import { toObjectId } from '../repositories/sessionRepository';

export interface CreateVisitDto {
    sessionId?: string;
    timestamp: Date;
    duration: number;
    referrer: string;
    page: string | null;
    utm_source: string | null;
}

export interface UpdateVisitDto {
    id: string;
    duration: number;
}

export interface Visit extends Document {
    sessionId?: Types.ObjectId;
    timestamp: Date;
    duration: number;
    referrer: string;
    page: string | null;
    utm_source: string | null;
    events?: Event[];
    createdAt: Date;
    updatedAt: Date;
}

const visitSchema = new Schema<Visit>({    
    sessionId: { 
        type: Schema.Types.ObjectId,
        ref: 'Session',
        index: true,
        sparse: true,
        validate: {
            validator: function(v: Types.ObjectId) {
                return Types.ObjectId.isValid(v);
            },
            message: 'Invalid ObjectId'
        }
    },
    timestamp: { 
        type: Date, 
        required: true,
        default: Date.now,
        index: true
    },
    duration: { 
        type: Number,
        required: true,
        default: 0,
        min: 0,
        validate: {
            validator: Number.isInteger,
            message: 'Duration must be an integer'
        }
    },
    referrer: { 
        type: String,
        required: true,
        default: '(direct)',
        index: true
    },
    page: { 
        type: String,
        default: null,
        index: true
    },
    utm_source: { 
        type: String,
        default: null,
        index: true,
        sparse: true
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

// Virtual populate for events
visitSchema.virtual('events', {
    ref: 'Event',
    localField: '_id',
    foreignField: 'visit'
});

// Compound indexes for common queries
visitSchema.index({ timestamp: 1, referrer: 1 });
visitSchema.index({ timestamp: 1, utm_source: 1 });
// Add compound index for sessionId and timestamp
visitSchema.index({ sessionId: 1, timestamp: 1 });

// Instance methods
visitSchema.methods.updateDuration = async function(duration: number) {
    this.duration = duration;
    return await this.save();
};

// Static methods interface
interface VisitModel extends Model<Visit> {
    findBySessionId(sessionId: string | Types.ObjectId): Promise<Visit[]>;
}

// Static methods
visitSchema.statics.findBySessionId = async function(sessionId: string | Types.ObjectId): Promise<Visit[]> {
    if (typeof sessionId === 'string') {
        sessionId = toObjectId(sessionId);
    }
    return this.find({ sessionId })
        .sort({ timestamp: 1 })
        .populate('events');
};

// Middleware
visitSchema.pre('save', function(next) {
    // Ensure timestamp is set
    if (!this.timestamp) {
        this.timestamp = new Date();
    }
    next();
});

// Export model with static methods
export const VisitModel = model<Visit, VisitModel>('Visit', visitSchema);
