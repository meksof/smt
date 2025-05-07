import { Schema, model, Document, Types } from 'mongoose';
import { Event } from './event';

export interface CreateVisitDto {
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

// Instance methods
visitSchema.methods.updateDuration = async function(duration: number) {
    this.duration = duration;
    return await this.save();
};

// Static methods
visitSchema.statics.findByPage = async function(page: string) {
    return await this.find({ page }).exec();
};

visitSchema.statics.findByReferrer = async function(referrer: string) {
    return await this.find({ referrer }).exec();
};

// Middleware
visitSchema.pre('save', function(next) {
    // Ensure timestamp is set
    if (!this.timestamp) {
        this.timestamp = new Date();
    }
    next();
});

export const VisitModel = model<Visit>('Visit', visitSchema);
