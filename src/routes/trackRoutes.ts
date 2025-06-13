import express from 'express';
import multer from 'multer';
const router = express.Router();
import { createVisit, updateVisit } from '../controllers/visitController';

const upload = multer();

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
// use body parser to handle multipart/form-data
router.post('/:id', upload.none(), async (req, res, next) => {
    try {
        // Convert form field names to match JSON format
        if (req.body.update_timestamp) {
            req.body.updateTimestamp = parseInt(req.body.update_timestamp);
            delete req.body.update_timestamp;
        }
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

