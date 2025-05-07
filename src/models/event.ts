import { Schema, model, Document, Types } from 'mongoose';
import { Visit } from './visit';

export type CreateEventDto = Pick<Event, 'type'|'value'| 'visit'>

export interface Event extends Document {
    type: string;
    value: string;
    timestamp: Date;
    visit: Types.ObjectId | Visit;
    createdAt: Date;
    updatedAt: Date;
}

const eventSchema = new Schema<Event>({
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

export const EventModel = model<Event>('Event', eventSchema);