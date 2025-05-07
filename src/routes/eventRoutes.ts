import express from 'express';
const router = express.Router();
import { createEvent } from '../controllers/eventController';

router.post('/', async (req, res, next) => {
    try {
        await createEvent(req, res);
    } catch (err) {
        next(err);
    }
});

export default router;
