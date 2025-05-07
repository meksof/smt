import { buildDateQuery } from '../utils';
import { VisitModel, Visit, CreateVisitDto, UpdateVisitDto } from '../models/visit';

export const createVisit = async (visitData: CreateVisitDto) => {
    try {
        const visit = new VisitModel(visitData);
        const result = await visit.save();
        return { insertedId: result._id };
    } catch (err) {
        console.error('Error creating visit:', err);
        throw err;
    }
};

export const updateVisitDuration = async (visit: UpdateVisitDto) => {
    try {
        const result = await VisitModel.findByIdAndUpdate(
            visit.id,
            { $set: { duration: visit.duration } },
            { new: true, runValidators: true }
        );

        if (!result) {
            throw new Error('Visit not found');
        }

        return { matchedCount: 1, modifiedCount: 1 };
    } catch (err) {
        console.error('Error updating visit duration:', err);
        throw err;
    }
};

export const countVisits = async (startDate: string, endDate: string) => {
    const query = buildDateQuery(startDate, endDate);
    return await VisitModel.countDocuments(query);
};

export const getAverageDuration = async (startDate: string, endDate: string) => {
    const query = buildDateQuery(startDate, endDate);
    const result = await VisitModel.aggregate([
        { $match: query },
        { 
            $group: { 
                _id: null, 
                avgDuration: { $avg: "$duration" } 
            } 
        }
    ]);

    return { avgDuration: result[0]?.avgDuration || 0 };
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
    query.utm_source = { $ne: null };

    const result = await VisitModel.aggregate([
        { $match: query },
        { 
            $group: { 
                _id: "$utm_source", 
                count: { $sum: 1 } 
            } 
        },
        { $sort: { count: -1 } }
    ]);

    return result.map(item => ({ 
        utm_source: item._id, 
        count: item.count 
    }));
};

// New methods utilizing Mongoose features

export const getVisitById = async (id: string) => {
    return await VisitModel.findById(id).exec();
};

export const getVisitsWithEvents = async (startDate: string, endDate: string) => {
    const query = buildDateQuery(startDate, endDate);
    return await VisitModel.find(query)
        .populate('events')
        .sort({ timestamp: -1 })
        .exec();
};
