import express from 'express';
const router = express.Router();
import { createVisit, updateVisit } from '../controllers/trackController';

// Create new visit
router.post('/', async (req, res, next) => {
    try {
        await createVisit(req, res);
    } catch (err) {
        next(err);
    }
});

/**
 * Update visit using POST method
 * Note: this is used to bypass the limitation of sendBeacon method in some browsers
 * which only allows sending data using POST method.
 * see: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon
 */
router.post('/:id', async (req, res, next) => {
    try {
        await updateVisit(req, res);
    } catch (err) {
        next(err);
    }
});
// Update visit duration using PATCH method
router.patch('/:id', async (req, res, next) => {
    try {
        await updateVisit(req, res);
    } catch (err) {
        next(err);
    }
});

export default router;

