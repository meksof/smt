import { buildDateQuery } from '../utils';
import { EventModel, Event } from '../models/event';

export const getEvents = async (startDate: string, endDate: string) => {
    const query = buildDateQuery(startDate, endDate);
    const result = await EventModel.aggregate([
        { $match: query },
        {
            $group: {
                _id: {
                    type: "$type",
                    value: "$value"
                },
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                type: "$_id.type",
                value: "$_id.value",
                count: 1,
                _id: 0
            }
        }
    ]);

    return result;
};

export const createEvent = async (eventData: Partial<Event>) => {
    try {
        const event = new EventModel(eventData);
        const result = await event.save();
        return { insertedId: result._id };
    } catch (err) {
        console.error('Error creating event:', err);
        throw err;
    }
};

export const getEventsByVisit = async (visitId: string) => {
    try {
        return await EventModel.find({ visit: visitId }).populate('visit');
    } catch (err) {
        console.error('Error getting events by visit:', err);
        throw err;
    }
};