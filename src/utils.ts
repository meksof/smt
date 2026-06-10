import { Types } from "mongoose";

export type TimeField = 'createdAt' | 'clientCreatedAt' | 'timestamp';

type DateQuery = {
    [key in TimeField]?: {
        $gte?: Date;
        $lte?: Date;
    }
}

export type Query = DateQuery & { utmSource?: { $ne: null } };

// Helper function to build date range queries
export const buildDateQuery = (startDate?: string, endDate?: string, timeField: TimeField = 'createdAt') => {
    const query: Query = {};
    if (startDate || endDate) {
        query[timeField] = {};
        if (startDate) {
            // Create date in UTC and set time to start of day
            const start = new Date(startDate + 'T00:00:00.000Z');
            query[timeField].$gte = start;
        }
        if (endDate) {
            // Create date in UTC and set time to end of day
            const end = new Date(endDate + 'T23:59:59.999Z');
            query[timeField].$lte = end;
        }
    }
    return query;
};

// Utility functions for session ID conversion
export const toObjectId = (id: string): Types.ObjectId => {
    try {
        return new Types.ObjectId(id);
    } catch (err) {
        throw new Error('Invalid session ID format');
    }
};

export const timestampMillisecondsToDate = (timestamp: number): Date => {
    return new Date(timestamp);
};

export const isValidTimestamp = (timestamp: number): boolean => {
    return !isNaN(timestamp) && timestamp > 0;
};

export const millisecondsToSeconds = (milliseconds: number): number => milliseconds / 1000;

export const isValidId = (id: string | string[]): id is string => {
    if (typeof id !== 'string') {
        return false
    }

    if (!Types.ObjectId.isValid(id)) {
        return false;
    }

    return true;
};