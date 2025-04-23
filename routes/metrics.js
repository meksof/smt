const express = require('express');
const router = express.Router();
const metricsController = require('../controllers/metricsController');

// Get all metrics
// router.get('/', metricsController.getMetrics);

// Total views count
router.get('/views', metricsController.getTotalViews);

// Average session duration
router.get('/sessions', metricsController.getAverageDuration);

// Top referrers
router.get('/referrers', metricsController.getTopReferrers);

// Traffic sources
router.get('/sources', metricsController.getTrafficSources);

// All events
router.get('/events', metricsController.getEvents);

module.exports = router;