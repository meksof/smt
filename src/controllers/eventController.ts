import { Request, Response } from 'express';
import { Types } from 'mongoose';
import * as eventModel from '../repositories/eventRepository';
import { VisitModel } from '../models/visit';
import { CreateEventDto } from '../models/event';

export const createEvent = async (req: Request, res: Response) => {
    try {
        const { type, value, visitId } = req.body;

        if (!type || !value || !visitId) {
            return res.status(400).json({ error: 'Type, value, and visitId are required' });
        }

        // Validate visitId format
        if (!Types.ObjectId.isValid(visitId)) {
            return res.status(400).json({ error: 'Invalid visitId format' });
        }

        // Check if visit exists
        const visit = await VisitModel.findById(visitId);
        if (!visit) {
            return res.status(404).json({ error: 'Visit not found' });
        }

        const event: CreateEventDto = {
            type,
            value,
            visit: visitId
        };

        const result = await eventModel.createEvent(event);
        res.json({ id: result.insertedId });
    } catch (err) {
        const error = err as Error;
        res.status(500).json({ error: error.message });
    }
};

export const getEvents = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;
        const events = await eventModel.getEvents(startDate as string, endDate as string);
        res.json(events);
    } catch (err) {
        const error = err as Error;
        res.status(500).json({ error: error.message });
    }
};