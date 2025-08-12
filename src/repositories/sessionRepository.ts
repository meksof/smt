import { Types } from 'mongoose';
import { SessionModel, Session } from '../models/session';
import { buildDateQuery } from '../utils';
import { CreateVisitDto } from '../models/visit';

// Utility functions for session ID conversion
export const toObjectId = (id: string): Types.ObjectId => {
    try {
        return new Types.ObjectId(id);
    } catch (err) {
        throw new Error('Invalid session ID format');
    }
};

export const getOrCreateSession = async (visit: CreateVisitDto): Promise<Session> => {
    try {
        if (!visit.sessionId) {
            // Create new session with new ObjectId
            const newSession = new SessionModel({
                userAgent: visit.userAgent,
                ip: visit.ip
            })
            const result = await newSession.save();
            return result;
        }

        // Check if session exists
        const existingSession = await SessionModel.findById(toObjectId(visit.sessionId));
        if (existingSession) {
            return existingSession;
        }
        // If session does not exist, create a new one
        const newSession = new SessionModel({
            _id: toObjectId(visit.sessionId),
            userAgent: visit.userAgent,
            ip: visit.ip
        });
        const result = await newSession.save();
        return result;
    } catch (err) {
        console.error('Error in session operation:', err);
        throw err;
    }
};

export const getSessionsByDateRange = async (startDate: string, endDate: string): Promise<Session[]> => {
    try {
        const query = buildDateQuery(startDate, endDate, 'createdAt');
        const sessions = await SessionModel.find(query)
            .populate('visits'); // Populate visits if needed

        return sessions;
    } catch (err) {
        console.error('Error getting sessions by date range:', err);
        throw err;
    }
};

export const getAverageSessionsDuration = async (startDate: string, endDate: string): Promise<{ averageDuration: number }> => {
    try {
        const sessions = await getSessionsByDateRange(startDate, endDate);

        if (sessions.length === 0) {
            return { averageDuration: 0 };
        }

        // Calculate total duration across all sessions
        let totalDuration = 0;

        for (const session of sessions) {
            // Use the virtual 'duration' field from the session model
            if (session.duration) {
                totalDuration += session.duration;
            }
        }

        // Calculate average duration
        const averageDuration = totalDuration / sessions.length;

        return { averageDuration: averageDuration };
    } catch (err) {
        console.error('Error calculating average session duration:', err);
        throw err;
    }
}

export const _getSession = async (sessionId: string) => {
    try {
        const session = await SessionModel.findById(toObjectId(sessionId))
            .populate('visits')
            .exec();

        return session;
    } catch (err) {
        console.error('Error getting visits by session:', err);
        throw err;
    }
}
