import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as visitModel from '../repositories/visitRepository';
import { CreateVisitDto, UpdateVisitDto } from '../models/visit';
import { isValidTimestamp } from '../utils';

export const createVisit = async (req: Request, res: Response) => {
    try {
        const { referrer, page, utmSource, createTimestamp } = req.body;
        const visit: CreateVisitDto = {
            createTimestamp: createTimestamp,
            referrer: referrer || '(direct)',
            page: page || null,
            utmSource: utmSource || null,
        };

        if (req.body.sessionId !== undefined)
        {
            visit.sessionId = req.body.sessionId;
        }

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
        let updateTimestamp: number;

        if (req.headers['content-type']?.includes('multipart/form-data')) {
            // Handle multipart/form-data
            const formData = req.body as { updateTimestamp: string };
            if (!formData.updateTimestamp) {
                return res.status(400).json({ error: 'updateTimestamp is required' });
            }

            updateTimestamp = parseInt(formData.updateTimestamp);
        } else {
            updateTimestamp = parseInt(req.body.updateTimestamp);
        }

        if (!isValidTimestamp(updateTimestamp)) {
            return res.status(400).json({ error: 'Invalid updateTimestamp value' });
        }

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid Visit ID format' });
        }

        const visit: UpdateVisitDto = {
            id,
            updateTimestamp
        }

        const result = await visitModel.updateVisitDuration(visit);

        if (result._id === null) {
            return res.status(404).json({ error: 'Visit not found' });
        }

        res.json({ success: true });
    } catch (err) {
        const error = err as Error;
        res.status(500).json({ error: error.message });
    }
};

export const getVisits = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;
        const visits = await visitModel.getVisitsWithEvents(startDate as string, endDate as string);
        res.json(visits);
    } catch (err) {
        const error = err as Error;
        res.status(500).json({ error: error.message });
    }
}