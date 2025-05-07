import { CreateEventDto } from '../models/event';
import { buildDateQuery } from '../utils';

let eventsCollection: any;

export const init = (db: any) => {
    eventsCollection = db.collection('events');
    eventsCollection.createIndex({ timestamp: 1 });
};

export const getEvents = async (startDate: string, endDate: string) => {
    const query = buildDateQuery(startDate, endDate);
    const pipeline = [];
    pipeline.push({ $match: query });
    pipeline.push(
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
    );
    const result = await eventsCollection.aggregate(pipeline).toArray();

    return result;
};

export const createEvent = async (event: CreateEventDto) => {
    const result = await eventsCollection.insertOne(event);
    return result;
};