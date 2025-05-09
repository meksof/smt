import express from 'express';
const router = express.Router();
import { getTotalViews, getAverageDuration, getTopReferrers, getTrafficSources } from '../controllers/metricsController';
import { getEvents } from '../controllers/eventController';

// Get all metrics
// router.get('/', getMetrics);

// Total views count
router.get('/views', getTotalViews);

// Average session duration
router.get('/sessions', getAverageDuration);

// Top referrers
router.get('/referrers', getTopReferrers);

// Traffic sources
router.get('/sources', getTrafficSources);

// All events
router.get('/events', getEvents);

export default router;