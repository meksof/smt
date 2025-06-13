import { buildDateQuery } from './utils';

describe('utils', () => {
    describe('buildDateQuery', () => {
        beforeEach(() => {
            // Reset timezone mocks between tests
            jest.useRealTimers();
        });

        it('should build correct date query with UTC dates', () => {
            const startDate = '2025-06-01';
            const endDate = '2025-06-30';

            const query = buildDateQuery(startDate, endDate);

            expect(query).toEqual({
                clientCreatedAt: {
                    $gte: new Date('2025-06-01T00:00:00.000Z'),
                    $lte: new Date('2025-06-30T23:59:59.999Z')
                }
            });
        });

        it.each([
            ['UTC-4 (New York)', '-04:00'],
            ['UTC+0 (London)', '+00:00'],
            ['UTC+8 (Singapore)', '+08:00']
        ])('should handle timezone %s correctly', (zoneName, offset) => {
            // Set system time to simulate different timezone
            const mockDate = new Date(`2025-06-01T12:00:00.000${offset}`);
            jest.useFakeTimers();
            jest.setSystemTime(mockDate);

            const query = buildDateQuery('2025-06-01', '2025-06-01');            // Should always use UTC regardless of system timezone
            const startTime = query.clientCreatedAt.$gte.toISOString();
            const endTime = query.clientCreatedAt.$lte.toISOString();

            expect(startTime).toBe('2025-06-01T00:00:00.000Z');
            expect(endTime).toBe('2025-06-01T23:59:59.999Z');
        });

        it('should build query with custom time field', () => {
            const startDate = '2025-06-01';
            const endDate = '2025-06-30';
            const timeField = 'timestamp';

            const query = buildDateQuery(startDate, endDate, timeField);

            expect(query).toEqual({
                timestamp: {
                    $gte: new Date('2025-06-01T00:00:00.000Z'),
                    $lte: new Date('2025-06-30T23:59:59.999Z')
                }
            });
        });

        it('should handle missing end date', () => {
            const startDate = '2025-06-01';
            const query = buildDateQuery(startDate, undefined);

            expect(query).toEqual({
                clientCreatedAt: {
                    $gte: new Date('2025-06-01T00:00:00.000Z')
                }
            });
        });

        it('should handle missing start date', () => {
            const endDate = '2025-06-30';
            const query = buildDateQuery(undefined, endDate);

            expect(query).toEqual({
                clientCreatedAt: {
                    $lte: new Date('2025-06-30T23:59:59.999Z')
                }
            });
        });

        it('should handle invalid date strings', () => {
            const startDate = 'invalid-date';
            const endDate = '2025-06-30';

            // Should not throw error but create Invalid Date
            const query = buildDateQuery(startDate, endDate);

            expect(query.clientCreatedAt.$gte.toString()).toBe('Invalid Date');
            expect(query.clientCreatedAt.$lte.toISOString()).toBe('2025-06-30T23:59:59.999Z');
        });

        it('should return empty query when no dates provided', () => {
            const query = buildDateQuery(undefined, undefined);
            expect(query).toEqual({});
        });

        it('should handle dates across different days in different timezones', () => {
            // Set up test dates
            const startDate = '2025-06-01';
            const endDate = '2025-06-02';

            // Test in different timezone (UTC+8)
            const mockDate = new Date('2025-06-01T00:00:00.000+08:00');
            jest.useFakeTimers();
            jest.setSystemTime(mockDate);

            const query = buildDateQuery(startDate, endDate);

            // Should still use UTC regardless of local timezone
            expect(query.clientCreatedAt.$gte.toISOString()).toBe('2025-06-01T00:00:00.000Z');
            expect(query.clientCreatedAt.$lte.toISOString()).toBe('2025-06-02T23:59:59.999Z');
        });
    });
});
