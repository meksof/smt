import { Types } from 'mongoose';
import { SessionModel, Session } from '../models/session';
import { buildDateQuery } from '../utils';
import { VisitModel } from '../models/visit';

// Utility functions for session ID conversion
export const toObjectId = (id: string): Types.ObjectId => {
    try {
        return new Types.ObjectId(id);
    } catch (err) {
        throw new Error('Invalid session ID format');
    }
};

export const getOrCreateSession = async (sessionId?: string): Promise<Session> => {
    try {
        if (!sessionId) {
            // Create new session with new ObjectId
            const newSession = new SessionModel({})
            const result = await newSession.save();
            return result;
        }

        // Check if session exists
        const existingSession = await SessionModel.findById(toObjectId(sessionId));
        if (existingSession) {
            return existingSession;
        }
        // If session does not exist, create a new one
        const newSession = new SessionModel({ _id: toObjectId(sessionId) });
        const result = await newSession.save();
        return result;
    } catch (err) {
        console.error('Error in session operation:', err);
        throw err;
    }
};

export const getSessionsByDateRange = async (startDate: string, endDate: string) => {
    try {
        const query = buildDateQuery(startDate, endDate);
        return await SessionModel.find(query)
            .populate({
                path: 'visits',
                options: { sort: { timestamp: 1 } }
            })
            .sort({ createdAt: -1 })
            .exec();
    } catch (err) {
        console.error('Error getting sessions by date range:', err);
        throw err;
    }
};

export const getVisitsBySession = async (id: string) => {
    try {
        const sessionId = toObjectId(id);
        // Static methods are available directly on the model
        return await VisitModel.findBySessionId(sessionId);
    } catch (err) {
        console.error('Error getting visits by session:', err);
        throw err;
    }
}