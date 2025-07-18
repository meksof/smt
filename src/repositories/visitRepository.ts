import { buildDateQuery } from '../utils';
import { VisitModel, CreateVisitDto, UpdateVisitDto } from '../models/visit';
import { getOrCreateSession } from './sessionRepository';
import { Session } from '../models/session';

export const createVisit = async (visitData: CreateVisitDto) => {    try {
        // Get or create session ID
        const session: Session = await getOrCreateSession(visitData.sessionId);
        
        // Create visit with session ID
        const visit = new VisitModel({
            ...visitData,
            sessionId: session._id  // Use _id instead of id
        });
        const result = await visit.save();
        return { insertedId: result._id, sessionId: session._id };
    } catch (err) {
        console.error('Error creating visit:', err);
        throw err;
    }
};

export const updateVisitDuration = async (visit: UpdateVisitDto) => {
    try {
        const result = await VisitModel.findByIdAndUpdate(
            visit.id,
            { $set: { duration: visit.duration, clientUpdatedAt: visit.updateTimestamp } },
            { new: true, runValidators: true }
        );

        if (!result) {
            throw new Error('Visit not found');
        }

        return result;
    } catch (err) {
        console.error('Error updating visit duration:', err);
        throw err;
    }
};

export const countVisits = async (startDate: string, endDate: string) => {
    const query = buildDateQuery(startDate, endDate);
    return await VisitModel.countDocuments(query);
};

export const getTopReferrers = async (startDate: string, endDate: string) => {
    const query = buildDateQuery(startDate, endDate);
    const result = await VisitModel.aggregate([
        { $match: query },
        { 
            $group: { 
                _id: "$referrer", 
                count: { $sum: 1 } 
            } 
        },
        { $sort: { count: -1 } }
    ]);

    return result.map(item => ({ 
        referrer: item._id, 
        count: item.count 
    }));
};

export const getTrafficSources = async (startDate: string, endDate: string) => {
    const query = buildDateQuery(startDate, endDate);
    query.utmSource = { $ne: null };

    const result = await VisitModel.aggregate([
        { $match: query },
        { 
            $group: { 
                _id: "$utmSource", 
                count: { $sum: 1 } 
            } 
        },
        { $sort: { count: -1 } }
    ]);

    return result.map(item => ({ 
        utmSource: item._id, 
        count: item.count 
    }));
};

export const getVisitsWithEvents = async (startDate: string, endDate: string) => {
    const query = buildDateQuery(startDate, endDate);
    return await VisitModel.find(query)
        .populate('events')
        .sort({ timestamp: -1 })
        .exec();
};

export const getVisitsBySessionId = async (sessionId: string) => {
    try {
        return await VisitModel.findBySessionId(sessionId);
    } catch (err) {
        console.error('Error finding visits by session ID:', err);
        throw err;
    }
};
