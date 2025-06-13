import { Request, Response } from 'express';
import * as visitModel from '../repositories/visitRepository';
import * as sessionModel from '../repositories/sessionRepository';

export const getTotalViews = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;
        const count = await visitModel.countVisits(startDate as string, endDate as string);
        res.json({ totalViews: count });
    } catch (err) {
        const error = err as Error;
        res.status(500).json({ error: error.message });
    }
};

export const getAverageSessionsDuration = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;
        const result = await sessionModel.getAverageSessionsDuration(startDate as string, endDate as string);
        res.json({ averageDuration: result?.averageDuration || 0 });
    } catch (err) {
        const error = err as Error;
        res.status(500).json({ error: error.message });
    }
};

export const getTopReferrers = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;
        const referrers = await visitModel.getTopReferrers(startDate as string, endDate as string);
        res.json(referrers);
    } catch (err) {
        const error = err as Error;
        res.status(500).json({ error: error.message });
    }
};

export const getTrafficSources = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;
        const sources = await visitModel.getTrafficSources(startDate as string, endDate as string);
        res.json(sources);
    } catch (err) {
        const error = err as Error;
        res.status(500).json({ error: error.message });
    }
};
