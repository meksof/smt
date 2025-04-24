const { ObjectId } = require('mongodb');
const { buildDateQuery } = require('../utils.js'); // Assuming you have a utility function for date queries

let visitsCollection;

module.exports.init = (db) => {
    visitsCollection = db.collection('visits');
    // Create indexes for better query performance
    visitsCollection.createIndex({ timestamp: 1 });
    visitsCollection.createIndex({ referrer: 1 });
    visitsCollection.createIndex({ page: 1 });
    visitsCollection.createIndex({ utm_source: 1 });
};

/**
 * Creates a new visit record
 * @param {Object} visitData - Visit data to insert
 * @returns {Promise<Object>} MongoDB insert result
 */
module.exports.createVisit = async (visitData) => {
    try {
        // Ensure required fields with defaults
        const visit = {
            timestamp: visitData.timestamp || new Date(),
            duration: visitData.duration || 0,
            referrer: visitData.referrer || '(direct)',
            page: visitData.page,
            utm_source: visitData.utm_source || null
        };

        const result = await visitsCollection.insertOne(visit);
        return result;
    } catch (err) {
        console.error('Error creating visit:', err);
        throw err;
    }
};

/**
 * Updates the duration of an existing visit
 * @param {string} visitId - The visit ID to update
 * @param {number} duration - New duration in seconds
 * @returns {Promise<Object>} MongoDB update result
 */
module.exports.updateVisitDuration = async (visitId, duration) => {
    try {
        // Validate and convert ID
        if (!ObjectId.isValid(visitId)) {
            throw new Error('Invalid visit ID format');
        }

        const objectId = new ObjectId(visitId);
        const durationValue = parseInt(duration);

        if (isNaN(durationValue)) {
            throw new Error('Invalid duration value');
        }

        const result = await visitsCollection.updateOne(
            { _id: objectId },
            { $set: { duration: durationValue } }
        );

        return result;
    } catch (err) {
        console.error('Error updating visit duration:', err);
        throw err;
    }
};

// Previously implemented methods remain the same
module.exports.countVisits = async (startDate, endDate) => {
    const query = buildDateQuery(startDate, endDate);
    return await visitsCollection.countDocuments(query);
};

module.exports.getAverageDuration = async (startDate, endDate) => {
    const query = buildDateQuery(startDate, endDate);
    const result = await visitsCollection.aggregate([
        { $match: query },
        { $group: { _id: null, avgDuration: { $avg: "$duration" } } }
    ]).toArray();

    return { avgDuration: result[0]?.avgDuration || 0 };
};

module.exports.getTopReferrers = async (startDate, endDate) => {
    const query = buildDateQuery(startDate, endDate);
    const result = await visitsCollection.aggregate([
        { $match: query },
        { $group: { _id: "$referrer", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]).toArray();

    return result.map(item => ({ referrer: item._id, count: item.count }));
};

module.exports.getTrafficSources = async (startDate, endDate) => {
    const query = buildDateQuery(startDate, endDate);
    query.utm_source = { $ne: null };

    const result = await visitsCollection.aggregate([
        { $match: query },
        { $group: { _id: "$utm_source", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]).toArray();

    return result.map(item => ({ utm_source: item._id, count: item.count }));
};
