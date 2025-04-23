const visitModel = require('../models/visitModel');
const eventModel = require('../models/eventModel');

exports.getTotalViews = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const count = await visitModel.countVisits(startDate, endDate);
        res.json({ count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAverageDuration = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const result = await visitModel.getAverageDuration(startDate, endDate);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTopReferrers = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const referrers = await visitModel.getTopReferrers(startDate, endDate);
        res.json(referrers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTrafficSources = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const sources = await visitModel.getTrafficSources(startDate, endDate);
        res.json(sources);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getEvents = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const events = await eventModel.getEvents(startDate, endDate);
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}