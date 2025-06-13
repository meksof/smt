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
          clientCreatedAt: new Date('2025-06-06T10:18:54.893Z'),
          clientUpdatedAt: new Date('2025-06-06T10:18:54.893Z'),
        },
        {
          _id: new Types.ObjectId('683ec5c835dfac72a7096b42'),
          sessionId: sessionId,
          duration: 2000,
          clientCreatedAt: new Date('2025-06-06T10:18:54.895Z'),
          clientUpdatedAt: new Date('2025-06-06T10:18:54.895Z'),
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
    it('should return the correct average duration for a session', async () => {
      // Create a session ID to use in our test
      const sessionId = new Types.ObjectId('683dc84f3e6713336beca4b3');

      // Mock sessions that would be used to calculate duration
      const mockSessions = [
        {
          _id: sessionId,
          createdAt: new Date(1717238400000), // 2024-06-01:00:00:00
          updatedAt: new Date(1717238450000), // 50 seconds later
          visits: [
            {
              _id: new Types.ObjectId('683dc84f3e6713336beca4b5'),
              sessionId: sessionId,
              clientCreatedAt: new Date(1717238400000),
              clientUpdatedAt: new Date(1717238450000),
              duration: 50000 // 50 seconds
            }
          ],
          duration: 50000, // Total duration for this session
          id: sessionId.toString()
        }
      ];

      // Set up the mock implementation
      (SessionModel.find as jest.Mock) = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockSessions)
      });

      // Call the function with test dates
      const result = await getAverageSessionsDuration('2024-06-01', '2024-06-02');

      // Verify the result
      expect(result).toEqual({ averageDuration: millisecondsToSeconds(50000) });
    });

    it('should handle the case with multiple visits for a session', async () => {
      // Create a session ID to use in our test
      const sessionId = new Types.ObjectId('683dc84f3e6713336beca4b3');

      const sessions = [
        {
          "_id": sessionId,
          "createdAt": "2025-06-03T08:43:39.674Z",
          "updatedAt": "2025-06-03T08:43:39.674Z",
          "visits": [
            {
              "_id": "683eb932a23cf1932af96338",
              "sessionId": "683eb5bb66d67b953903f276",
              "client_createdAt": "2025-06-03T08:58:26.310Z",
              "referrer": "http://localhost:4321/fr/",
              "page": "http://localhost:4321/en/",
              "duration": 5714,
              "client_updatedAt": "2025-06-03T08:58:32.024Z",
              "createdAt": "2025-06-03T08:58:26.401Z",
              "updatedAt": "2025-06-03T08:58:37.079Z",
              "utmSource": null,
              "clientCreatedAt": "2025-06-12T14:14:51.564Z",
              "clientUpdatedAt": "2025-06-12T14:14:51.564Z",
              "id": "683eb932a23cf1932af96338"
            },
            {
              "_id": "683eb938a23cf1932af96346",
              "sessionId": "683eb5bb66d67b953903f276",
              "client_createdAt": "2025-06-03T08:58:32.358Z",
              "referrer": "http://localhost:4321/en/",
              "page": "http://localhost:4321/en/projects",
              "duration": 5379,
              "client_updatedAt": "2025-06-03T08:58:37.737Z",
              "createdAt": "2025-06-03T08:58:32.633Z",
              "updatedAt": "2025-06-03T08:58:37.970Z",
              "utmSource": null,
              "clientCreatedAt": "2025-06-12T14:14:51.564Z",
              "clientUpdatedAt": "2025-06-12T14:14:51.564Z",
              "id": "683eb938a23cf1932af96346"
            }],
            "duration": 11093, // Total duration for this session
            "id": "683eb5bb66d67b953903f276"
        }
      ];

      // Set up the mock implementation
      (SessionModel.find as jest.Mock) = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(sessions)
      });

      // Call the function with test dates
      const result = await getAverageSessionsDuration('2024-06-01', '2024-06-02');

      // Verify the result - one session with total duration of 11093 ms (11 seconds)
      expect(result).toEqual({ averageDuration: millisecondsToSeconds(11093) });
    });

    it('should handle multiple sessions correctly', async () => {
      // Create session IDs to use in our test
      const sessionId1 = new Types.ObjectId('683dc84f3e6713336beca4b3');
      const sessionId2 = new Types.ObjectId('683dc84f3e6713336beca4b4');

      const sessions = [
        {
          _id: sessionId1,
          createdAt: new Date(1717238400000), // 2024-06-01:00:00:00
          updatedAt: new Date(1717238450000), // 50 seconds later
          visits: [
            {
              _id: new Types.ObjectId('683dc84f3e6713336beca4b5'),
              sessionId: sessionId1,
              clientCreatedAt: new Date(1717238400000),
              clientUpdatedAt: new Date(1717238450000),
              duration: 50000 // 50 seconds
            }
          ],
          duration: 50000, // Total duration for this session
          id: sessionId1.toString()
        },
        {
          _id: sessionId2,
          createdAt: new Date(1717324800000), // 2024-06-02:00:00:00
          updatedAt: new Date(1717324828000), // 2.8 seconds later
          visits: [
            {
              _id: new Types.ObjectId('683dc84f3e6713336beca4b6'),
              sessionId: sessionId2,
              clientCreatedAt: new Date(1717324800000),
              clientUpdatedAt: new Date(1717324828000),
              duration: 28000 // 28 seconds
            }
          ],
          duration: 28000, // Total duration for this session
          id: sessionId2.toString()
        }
      ];

      // Set up the mock implementation
      (SessionModel.find as jest.Mock) = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(sessions)
      });

      // Call the function with test dates
      const result = await getAverageSessionsDuration('2024-06-01', '2024-06-02');

      // Verify the result
      // Session 1: 50000 ms
      // Session 2: 28000 ms
      // Average: (50000 + 28000) / 2 = 39000 ms
      expect(result).toEqual({ averageDuration: millisecondsToSeconds(39000) });
    });
  });
}); 