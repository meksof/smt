const { ObjectId } = require('mongodb');
const visitModel = require('../models/visitModel');

exports.createVisit = async (req, res) => {
    try {
        const { duration, referrer, page, utm_source } = req.body;
        const visit = {
            timestamp: new Date(), // Current date/time
            duration: duration || 0,
            referrer: referrer || '(direct)',
            page: page || null,
            utm_source: utm_source || null
        };

        const result = await visitModel.createVisit(visit);
        res.json({ id: result.insertedId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * * Update visit duration endpoint
 * Note: The method is POST instead of PATCH
 * This is due to sendBeacon API limitations.
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon#limitations
 */
// Unified endpoint that handles both JSON and FormData
exports.updateVisit = async (req, res) => {
    try {
        const { id } = req.params;
        let duration;

        // Check if content-type is application/x-www-form-urlencoded
        if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
            duration = parseInt(req.body.duration);
        }
        // Otherwise assume JSON
        else {
            duration = req.body.duration;
        }

        if (isNaN(duration)) {
            return res.status(400).json({ error: 'Invalid duration value' });
        }

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid session ID format' });
        }

        const objectId = new ObjectId(id);

        const result = await visitModel.updateVisitDuration(
            objectId, duration
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Error updating session:', err);
        res.status(500).json({ error: err.message });
    }
};

