import { getAverageSessionsDuration, getSessionsByDateRange } from './sessionRepository';
import { SessionModel } from '../models/session';
import { Types } from 'mongoose';
import { millisecondsToSeconds } from '../utils';
// Mock the mongoose models
jest.mock('../models/session');
jest.mock('../models/visit');

describe('sessionRepository', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('_getSessions', () => {
    it('should return sessions with calculated durations from visits', async () => {
      // Create a session ID
      const sessionId = new Types.ObjectId('683eb5bb66d67b953903f276');

      // Create mock visits for the session
      const mockVisits = [
        {
          _id: new Types.ObjectId('683eb932a23cf1932af96338'),
          sessionId: sessionId,
          duration: 1000,
          createdAt: new Date('2025-06-06T10:18:54.893Z'),
          updatedAt: new Date('2025-06-06T10:19:54.893Z'),
        },
        {
          _id: new Types.ObjectId('683ec5c835dfac72a7096b42'),
          sessionId: sessionId,
          duration: 2000,
          createdAt: new Date('2025-06-06T10:18:54.895Z'),
          updatedAt: new Date('2025-06-06T10:20:54.895Z'),
        }
      ];

      // Create a mock session with a calculated duration property
      const mockSession = {
        _id: sessionId,
        createdAt: new Date('2025-06-06T09:59:45.493Z'),
        updatedAt: new Date('2025-06-06T09:59:45.493Z'),
        visits: mockVisits,
        // The duration should be the sum of all visit durations (3000)
        get duration() {
          return this.visits.reduce((sum: number, visit: any) => sum + visit.duration, 0);
        },
        id: sessionId.toString()
      };

      // Set up the mock implementation for SessionModel.find()
      const mockFind = jest.fn().mockReturnThis();
      const mockPopulate = jest.fn().mockResolvedValue([mockSession]);

      (SessionModel.find as jest.Mock) = mockFind;
      mockFind.mockReturnValue({ populate: mockPopulate });

      // Call the function
      const result = await getSessionsByDateRange('2024-06-01', '2024-06-02');

      // Verify the session has the correct duration (sum of visit durations = 3000)
      expect((result[0] as any).duration).toBe(3000);

      // Verify that populate was called with 'visits'
      expect(mockPopulate).toHaveBeenCalledWith('visits');
    });
  });

  describe('getAverageSessionsDuration', () => {
    it('should handle the case with multiple visits for a session', async () => {
      // Create a session ID
      const sessionId = new Types.ObjectId('683eb5bb66d67b953903f276');
      
      // Create mock visits for the session
      const mockVisits = [
        {
          _id: new Types.ObjectId('683eb932a23cf1932af96338'),
          sessionId: sessionId,
          durationInMilliSec: 1000,
          createdAt: new Date('2025-06-06T10:18:54.893Z'),
          updatedAt: new Date('2025-06-06T10:19:54.893Z'),
        },
        {
          _id: new Types.ObjectId('683ec5c835dfac72a7096b42'),
          sessionId: sessionId,
          durationInMilliSec: 2000,
          createdAt: new Date('2025-06-06T10:18:54.895Z'),
          updatedAt: new Date('2025-06-06T10:20:54.895Z'),
        }
      ];

      // Create a mock session with the mocked visits
      const mockSession = {
        _id: sessionId,
        createdAt: new Date('2025-06-06T09:59:45.493Z'),
        updatedAt: new Date('2025-06-06T09:59:45.493Z'),
        visits: mockVisits,
        // The duration should be the sum of all visit durations (3000)
        get durationInMilliSec() {
          return this.visits.reduce((sum: number, visit: any) => sum + visit.durationInMilliSec, 0);
        },
        id: sessionId.toString()
      };

      // Set up the mock implementation for SessionModel.find()
      const mockFind = jest.fn().mockReturnThis();
      const mockPopulate = jest.fn().mockResolvedValue([mockSession]);

      (SessionModel.find as jest.Mock) = mockFind;
      mockFind.mockReturnValue({ populate: mockPopulate });

      // Call the function with test dates
      const result = await getAverageSessionsDuration('2024-06-01', '2024-06-02');

      // Verify the average duration is correct (3000 ms for one session)
      expect(result).toEqual({ averageDurationInSeconds: millisecondsToSeconds(3000) });

    });

    it('should handle multiple sessions correctly', async () => {
      // Create session IDs to use in our test
      const sessionId1 = new Types.ObjectId('683dc84f3e6713336beca4b3');
      const sessionId2 = new Types.ObjectId('683dc84f3e6713336beca4b4');

      // Create mock visits for the sessions
      const mockVisitsSession1 = [
        {
          _id: new Types.ObjectId('683eb932a23cf1932af96338'),
          sessionId: sessionId1,
          durationInMilliSec: 50000, // 50 seconds
          createdAt: new Date('2025-06-06T10:18:54.893Z'),
          updatedAt: new Date('2025-06-06T10:19:54.893Z'),
        }
      ];

      const mockVisitsSession2 = [
        {
          _id: new Types.ObjectId('683ec5c835dfac72a7096b42'),
          sessionId: sessionId2,
          durationInMilliSec: 28000, // 28 seconds
          createdAt: new Date('2025-06-06T10:18:54.895Z'), // 54 + 28 = 82 seconds total = 1min 22 seconds
          updatedAt: new Date('2025-06-06T10:19:22.895Z'),
        }
      ];

      // Create mock sessions with the mocked visits
      const mockSession1 = {
        _id: sessionId1,
        createdAt: new Date('2025-06-06T09:59:45.493Z'),
        updatedAt: new Date('2025-06-06T09:59:45.493Z'),
        visits: mockVisitsSession1,
        get durationInMilliSec() {
          return this.visits.reduce((sum: number, visit: any) => sum + visit.durationInMilliSec, 0);
        },
        id: sessionId1.toString()
      };

      const mockSession2 = {
        _id: sessionId2,
        createdAt: new Date('2025-06-06T09:59:45.493Z'),
        updatedAt: new Date('2025-06-06T09:59:45.493Z'),
        visits: mockVisitsSession2,
        get durationInMilliSec() {
          return this.visits.reduce((sum: number, visit: any) => sum + visit.durationInMilliSec, 0);
        },
        id: sessionId2.toString()
      };

      // Set up the mock implementation for SessionModel.find()
      const mockFind = jest.fn().mockReturnThis();
      const mockPopulate = jest.fn().mockResolvedValue([mockSession1, mockSession2]);

      (SessionModel.find as jest.Mock) = mockFind;
      mockFind.mockReturnValue({ populate: mockPopulate });

      // Call the function with test dates
      const result = await getAverageSessionsDuration('2024-06-06', '2024-06-06');

      // Verify the result
      // Session 1: 50000 ms
      // Session 2: 28000 ms
      // Average: (50000 + 28000) / 2 = 39000 ms
      expect(result).toEqual({ averageDurationInSeconds: millisecondsToSeconds(39000) });
    });
  });
}); 