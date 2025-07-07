import { countVisits } from './visitRepository';
import { VisitModel } from '../models/visit';
import mockVisits from './__mocks__/visits.json';

// Mock the mongoose models
jest.mock('../models/visit');

describe('visitRepository', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe('countVisits', () => {
        it('should return the correct count of visits within a date range', async () => {
            // Mock the countDocuments implementation
            const mockCountDocuments = jest.fn().mockResolvedValue(5);
            (VisitModel.countDocuments as jest.Mock) = mockCountDocuments;

            const startDate = '2025-06-01';
            const endDate = '2025-06-30';

            const count = await countVisits(startDate, endDate);

            // Verify the count is correct
            expect(count).toBe(5);

            // Verify countDocuments was called with the correct query
            expect(mockCountDocuments).toHaveBeenCalledWith({
                createdAt: {
                    $gte: expect.any(Date), // Start of June 1, 2025
                    $lte: expect.any(Date)  // End of June 30, 2025
                }
            });

            // Verify the exact dates in the query
            const query = mockCountDocuments.mock.calls[0][0];
            expect(query.createdAt.$gte.toISOString()).toBe('2025-06-01T00:00:00.000Z');
            expect(query.createdAt.$lte.toISOString()).toBe('2025-06-30T23:59:59.999Z');
        });

        it('should return 0 when no visits are found', async () => {
            // Mock countDocuments to return 0
            const mockCountDocuments = jest.fn().mockResolvedValue(0);
            (VisitModel.countDocuments as jest.Mock) = mockCountDocuments;

            const startDate = '2025-06-01';
            const endDate = '2025-06-30';

            const count = await countVisits(startDate, endDate);

            expect(count).toBe(0);
            expect(mockCountDocuments).toHaveBeenCalled();
        });

        it('should handle missing date parameters', async () => {
            // Mock countDocuments to return a number
            const mockCountDocuments = jest.fn().mockResolvedValue(10);
            (VisitModel.countDocuments as jest.Mock) = mockCountDocuments;

            // Test with undefined dates
            const count = await countVisits(undefined as unknown as string, undefined as unknown as string);

            expect(count).toBe(10);
            // Should be called with an empty query object when no dates are provided
            expect(mockCountDocuments).toHaveBeenCalledWith({});
        });

        it('should propagate errors from the database', async () => {
            // Mock countDocuments to throw an error
            const mockError = new Error('Database connection failed');
            const mockCountDocuments = jest.fn().mockRejectedValue(mockError);
            (VisitModel.countDocuments as jest.Mock) = mockCountDocuments;

            const startDate = '2025-06-01';
            const endDate = '2025-06-30';

            // The function should throw the error
            await expect(countVisits(startDate, endDate)).rejects.toThrow('Database connection failed');
        });

        it('should count visits from mock data within date range', async () => {
            // Setup mock data
            const visits = mockVisits.visits;
            
            // Mock countDocuments to simulate counting based on date range
            const mockCountDocuments = jest.fn().mockImplementation((query) => {
                return visits.filter(visit => {
                    const visitDate = new Date(visit.createdAt);
                    const startDate = query.createdAt?.$gte;
                    const endDate = query.createdAt?.$lte;
                    
                    if (!startDate && !endDate) return true;
                    if (!startDate) return visitDate <= endDate;
                    if (!endDate) return visitDate >= startDate;
                    
                    return visitDate >= startDate && visitDate <= endDate;
                }).length;
            });
            
            (VisitModel.countDocuments as jest.Mock) = mockCountDocuments;

            // Test different date ranges
            const testCases = [
                {
                    startDate: '2025-06-01',
                    endDate: '2025-06-30',
                    expectedCount: 3  // All visits
                },
                {
                    startDate: '2025-06-01',
                    endDate: '2025-06-14',
                    expectedCount: 1  // Only first visit
                },
                {
                    startDate: '2025-06-15',
                    endDate: '2025-06-30',
                    expectedCount: 2  // Second and third visits
                }
            ];

            for (const testCase of testCases) {
                const count = await countVisits(testCase.startDate, testCase.endDate);
                expect(count).toBe(testCase.expectedCount);
                
                // Verify query structure
                expect(mockCountDocuments).toHaveBeenCalledWith({
                    createdAt: {
                        $gte: expect.any(Date),
                        $lte: expect.any(Date)
                    }
                });
            }

            // Verify total number of calls
            expect(mockCountDocuments).toHaveBeenCalledTimes(3);
        });
    });
});
