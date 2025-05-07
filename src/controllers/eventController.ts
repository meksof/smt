import { Request, Response } from 'express';
import { CreateEventDto } from '../models/event';
import * as eventModel from '../repositories/eventRepository';

export const createEvent = async (req: Request, res: Response) => {
    try {
        const { type, value } = req.body;

        if (!type || !value) {
            return res.status(400).json({ error: 'Type and value are required' });
        }

        const event: CreateEventDto = {
            type,
            value,
            timestamp: new Date()
        };

        const result = await eventModel.createEvent(event);
        res.json({ id: result.insertedId });
    } catch (err) {
        const error = err as Error;
        res.status(500).json({ error: error.message });
    }
};