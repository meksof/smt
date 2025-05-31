import { Schema, model, Document, Types } from 'mongoose';
import { Visit } from './visit';

export type CreateEventDto = Pick<Event, 'type'|'value'| 'visit'>

export interface Event extends Document {
    _id: Types.ObjectId;
    type: string;
    value: string;
    timestamp: Date;
    visit: Types.ObjectId | Visit;
    createdAt: Date;
    updatedAt: Date;
}

const eventSchema = new Schema<Event>({
    _id: {
        type: Schema.Types.ObjectId,
        default: () => new Types.ObjectId(),
        required: true
    },
    type: {
        type: String,
        required: true,
        index: true
    },
    value: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    visit: {
        type: Schema.Types.ObjectId,
        ref: 'Visit',
        required: true
    }
}, {
    timestamps: true
});


// Middleware
eventSchema.pre('save', function(next) {
    // Ensure timestamp is set
    if (!this.timestamp) {
        this.timestamp = new Date();
    }
    next();
});

// Create proper indexes
eventSchema.index({ type: 1 });
eventSchema.index({ visit: 1 });
eventSchema.index({ timestamp: 1 });

export const EventModel = model<Event>('Event', eventSchema);