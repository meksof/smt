import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as visitModel from '../repositories/visitRepository';
import { CreateVisitDto, UpdateVisitDto } from '../models/visit';

export const createVisit = async (req: Request, res: Response) => {
    try {
        const { duration, referrer, page, utm_source } = req.body;
        const visit: CreateVisitDto = {
            timestamp: new Date(),
            duration: duration || 0,
            referrer: referrer || '(direct)',
            page: page || null,
            utm_source: utm_source || null,
            sessionId: req.body.sessionId ?? undefined
        };

        const result = await visitModel.createVisit(visit);
        res.json({ id: result.insertedId, sessionId: result.sessionId });
    } catch (err) {
        const error = err as Error;
        res.status(500).json({ error: error.message });
    }
};

export const updateVisit = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        let duration;

        if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
            duration = parseInt(req.body.duration);
        } else {
            duration = req.body.duration;
        }

        if (isNaN(duration)) {
            return res.status(400).json({ error: 'Invalid duration value' });
        }

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid session ID format' });
        }

        const visit: UpdateVisitDto = {
            id,
            duration
        }

        const result = await visitModel.updateVisitDuration(visit);

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.json({ success: true });
    } catch (err) {
        const error = err as Error;
        res.status(500).json({ error: error.message });
    }
};

