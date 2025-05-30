// Helper function to build date range queries
export const buildDateQuery = (startDate?: string, endDate?: string) => {
    const query: any = {};
    if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            query.timestamp.$gte = start;
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            query.timestamp.$lte = end;
        }
    }
    return query;
};