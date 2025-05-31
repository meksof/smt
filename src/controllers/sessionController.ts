import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { getVisitsBySession } from '../repositories/sessionRepository';

export const getVisits = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid session ID format' });        }
        
        const session = await getVisitsBySession(id);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        return res.json(session);
    } catch (err) {
        const error = err as Error;
        res.status(500).json({ error: error.message });
    }
};