import { Db, ObjectId } from 'mongodb';
import { buildDateQuery } from '../utils';
import { CreateVisitDto, UpdateVisitDto } from '../models/visit';

let visitsCollection: any;

export const init = (db: Db) => {
    visitsCollection = db.collection('visits');
    // Create indexes for better query performance
    visitsCollection.createIndex({ timestamp: 1 });
};

export const createVisit = async (visit: CreateVisitDto) => {
    try {
        // Ensure required fields with defaults
        const createVisit: CreateVisitDto = {
            timestamp: visit.timestamp || new Date(),
            duration: visit.duration || 0,
            referrer: visit.referrer || '(direct)',
            page: visit.page,
            utm_source: visit.utm_source || null
        };

        const result = await visitsCollection.insertOne(createVisit);
        return result;
    } catch (err) {
        console.error('Error creating visit:', err);
        throw err;
    }
};

export const updateVisitDuration = async (visit: UpdateVisitDto) => {
    try {
        // Validate and convert ID
        if (!ObjectId.isValid(visit.id)) {
            throw new Error('Invalid visit ID format');
        }

        const objectId = new ObjectId(visit.id);
        const duration = parseInt(visit.duration.toString());

        if (isNaN(duration)) {
            throw new Error('Invalid duration value');
        }

        const result = await visitsCollection.updateOne(
            { _id: objectId },
            { $set: { duration: duration } }
        );

        return result;
    } catch (err) {
        throw err;
    }
};

export const countVisits = async (startDate: string, endDate: string) => {
    const query = buildDateQuery(startDate, endDate);
    return await visitsCollection.countDocuments(query);
};

export const getAverageDuration = async (startDate: string, endDate: string) => {
    const query = buildDateQuery(startDate, endDate);
    const result = await visitsCollection.aggregate([
        { $match: query },
        { $group: { _id: null, avgDuration: { $avg: "$duration" } } }
    ]).toArray();

    return { avgDuration: result[0]?.avgDuration || 0 };
};

export const getTopReferrers = async (startDate: string, endDate: string) => {
    const query = buildDateQuery(startDate, endDate);
    const result = await visitsCollection.aggregate([
        { $match: query },
        { $group: { _id: "$referrer", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]).toArray();

    return result.map((item: { _id: string; count: number }) => ({ referrer: item._id, count: item.count }));
};

export const getTrafficSources = async (startDate: string, endDate: string) => {
    const query = buildDateQuery(startDate, endDate);
    query.utm_source = { $ne: null };

    const result = await visitsCollection.aggregate([
        { $match: query },
        { $group: { _id: "$utm_source", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]).toArray();

    return result.map((item: { _id: string; count: number }) => ({ utm_source: item._id, count: item.count }));
};
