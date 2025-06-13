import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { _getSession, getSessionsByDateRange } from '../repositories/sessionRepository';

export const getSession = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid session ID format' });        }
        
        const session = await _getSession(id);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        return res.json(session);
    } catch (err) {
        const error = err as Error;
        res.status(500).json({ error: error.message });
    }
};

export const getSessions = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;
        const sessions = await getSessionsByDateRange(startDate as string, endDate as string);
        res.json(sessions);
    } catch (err) {
        const error = err as Error;
        res.status(500).json({ error: error.message });
    }
};