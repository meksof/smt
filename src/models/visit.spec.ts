import { Types } from 'mongoose';
import { VisitModel } from './visit';
import mockVisits from '../repositories/__mocks__/visits.json';

// Mock mongoose Query methods for database interaction
jest.mock('mongoose');

describe('VisitModel.findBySessionId', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe('findBySessionId behavior with valid sessionId', () => {
        it('should call find with sessionId parameter', async () => {
            const validSessionId = new Types.ObjectId().toString();
            const mockVisitsData = [
                {
                    _id: mockVisits.visits[0]._id,
                    sessionId: validSessionId,
                    clientCreatedAt: new Date(mockVisits.visits[0].clientCreatedAt),
                    referrer: mockVisits.visits[0].referrer,
                    page: mockVisits.visits[0].page,
                    utmSource: mockVisits.visits[0].utm_source,
                    durationInMilliSec: mockVisits.visits[0].duration,
                    createdAt: new Date(mockVisits.visits[0].createdAt),
                    updatedAt: new Date(mockVisits.visits[0].createdAt)
                }
            ];

            // Mock the query chain
            const mockPopulate = jest.fn().mockResolvedValue(mockVisitsData);
            const mockSort = jest.fn().mockReturnValue({ populate: mockPopulate });
            const mockFind = jest.fn().mockReturnValue({ sort: mockSort });

            (VisitModel.find as jest.Mock) = mockFind;

            // Execute the actual findBySessionId implementation
            const result = await VisitModel.findBySessionId(validSessionId);

            expect(mockFind).toHaveBeenCalledWith({ sessionId: validSessionId });
            expect(mockSort).toHaveBeenCalledWith({ clientCreatedAt: -1 });
            expect(mockPopulate).toHaveBeenCalledWith('events');
            expect(result).toEqual(mockVisitsData);
        });

        it('should return empty array when no visits found for valid sessionId', async () => {
            const validSessionId = new Types.ObjectId().toString();

            // Mock the query chain to return empty array
            const mockPopulate = jest.fn().mockResolvedValue([]);
            const mockSort = jest.fn().mockReturnValue({ populate: mockPopulate });
            const mockFind = jest.fn().mockReturnValue({ sort: mockSort });

            (VisitModel.find as jest.Mock) = mockFind;

            // Execute the actual findBySessionId implementation
            const result = await VisitModel.findBySessionId(validSessionId);

            expect(result).toEqual([]);
            expect(Array.isArray(result)).toBe(true);
        });

        it('should return visits sorted by clientCreatedAt in descending order', async () => {
            const validSessionId = new Types.ObjectId().toString();

            // Create mock visits with different dates in descending order
            const mockVisitsData = [
                {
                    _id: mockVisits.visits[2]._id,
                    sessionId: validSessionId,
                    clientCreatedAt: new Date(mockVisits.visits[2].clientCreatedAt),
                    referrer: mockVisits.visits[2].referrer,
                    page: mockVisits.visits[2].page,
                    utmSource: mockVisits.visits[2].utm_source,
                    durationInMilliSec: mockVisits.visits[2].duration,
                    createdAt: new Date(mockVisits.visits[2].createdAt),
                    updatedAt: new Date(mockVisits.visits[2].createdAt)
                },
                {
                    _id: mockVisits.visits[1]._id,
                    sessionId: validSessionId,
                    clientCreatedAt: new Date(mockVisits.visits[1].clientCreatedAt),
                    referrer: mockVisits.visits[1].referrer,
                    page: mockVisits.visits[1].page,
                    utmSource: mockVisits.visits[1].utm_source,
                    durationInMilliSec: mockVisits.visits[1].duration,
                    createdAt: new Date(mockVisits.visits[1].createdAt),
                    updatedAt: new Date(mockVisits.visits[1].createdAt)
                },
                {
                    _id: mockVisits.visits[0]._id,
                    sessionId: validSessionId,
                    clientCreatedAt: new Date(mockVisits.visits[0].clientCreatedAt),
                    referrer: mockVisits.visits[0].referrer,
                    page: mockVisits.visits[0].page,
                    utmSource: mockVisits.visits[0].utm_source,
                    durationInMilliSec: mockVisits.visits[0].duration,
                    createdAt: new Date(mockVisits.visits[0].createdAt),
                    updatedAt: new Date(mockVisits.visits[0].createdAt)
                }
            ];

            // Mock the query chain
            const mockPopulate = jest.fn().mockResolvedValue(mockVisitsData);
            const mockSort = jest.fn().mockReturnValue({ populate: mockPopulate });
            const mockFind = jest.fn().mockReturnValue({ sort: mockSort });

            (VisitModel.find as jest.Mock) = mockFind;

            // Execute the actual findBySessionId implementation
            const result = await VisitModel.findBySessionId(validSessionId);

            // Verify the sort is called with clientCreatedAt: -1 (descending)
            expect(mockSort).toHaveBeenCalledWith({ clientCreatedAt: -1 });
            expect(result.length).toBe(3);
            // Verify descending order by checking dates
            for (let i = 0; i < result.length - 1; i++) {
                expect(result[i].clientCreatedAt.getTime())
                    .toBeGreaterThanOrEqual(result[i + 1].clientCreatedAt.getTime());
            }
        });

        it('should populate events relationship', async () => {
            const validSessionId = new Types.ObjectId().toString();
            const mockVisitsData = [
                {
                    _id: mockVisits.visits[0]._id,
                    sessionId: validSessionId,
                    clientCreatedAt: new Date(mockVisits.visits[0].clientCreatedAt),
                    referrer: mockVisits.visits[0].referrer,
                    page: mockVisits.visits[0].page,
                    utmSource: mockVisits.visits[0].utm_source,
                    durationInMilliSec: mockVisits.visits[0].duration,
                    createdAt: new Date(mockVisits.visits[0].createdAt),
                    updatedAt: new Date(mockVisits.visits[0].createdAt),
                    events: [{ _id: 'event1', type: 'click' }]
                }
            ];

            // Mock the query chain
            const mockPopulate = jest.fn().mockResolvedValue(mockVisitsData);
            const mockSort = jest.fn().mockReturnValue({ populate: mockPopulate });
            const mockFind = jest.fn().mockReturnValue({ sort: mockSort });

            (VisitModel.find as jest.Mock) = mockFind;

            // Execute the actual findBySessionId implementation
            const result = await VisitModel.findBySessionId(validSessionId);

            // Verify populate was called with 'events'
            expect(mockPopulate).toHaveBeenCalledWith('events');
            expect(result[0].events).toBeDefined();
        });

        it('should handle database errors properly', async () => {
            const validSessionId = new Types.ObjectId().toString();
            const dbError = new Error('Database connection failed');

            // Mock the query chain to reject
            const mockPopulate = jest.fn().mockRejectedValue(dbError);
            const mockSort = jest.fn().mockReturnValue({ populate: mockPopulate });
            const mockFind = jest.fn().mockReturnValue({ sort: mockSort });

            (VisitModel.find as jest.Mock) = mockFind;

            // Execute the actual findBySessionId implementation and expect error
            await expect(
                VisitModel.findBySessionId(validSessionId)
            ).rejects.toThrow('Database connection failed');
        });
    });
});
