const { buildDateQuery } = require('../utils.js');

let eventsCollection;

module.exports.init = (db) => {
    eventsCollection = db.collection('events');
    eventsCollection.createIndex({ timestamp: 1 });
    eventsCollection.createIndex({ type: 1 });
    eventsCollection.createIndex({ value: 1 });
};

module.exports.getEvents = async (startDate, endDate) => {

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

    return result
}

module.exports.createEvent = async (event) => {
    const result = await eventsCollection.insertOne(event);
    return result;
};