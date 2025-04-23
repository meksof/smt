const eventModel = require('../models/eventModel');

exports.createEvent = async (req, res) => {
    try {
        const { type, value } = req.body;

        if (!type || !value) {
            return res.status(400).json({ error: 'Type and value are required' });
        }

        const event = {
            type,
            value,
            timestamp: new Date()
        };

        const result = await eventModel.createEvent(event);
        res.json({ id: result.insertedId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}