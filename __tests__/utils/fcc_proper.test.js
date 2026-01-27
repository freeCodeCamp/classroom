/**
 * Tests for FCC Proper two-call validation utilities
 * Tests the email→userId lookup and userId→studentData retrieval
 */

// Mock next-auth
jest.mock('next-auth/react', () => ({
  getSession: jest.fn()
}));

const { getSession } = require('next-auth/react');

// We'll mock the fetch function globally
global.fetch = jest.fn();

const {
  fetchFromFCC,
  getFccProperUserIdByEmail,
  getStudentDataByUserIds
} = require('../../util/fcc_proper');

describe('fcc_proper utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
    getSession.mockClear();
  });

  describe('getFccProperUserIdByEmail', () => {
    it('should fetch FCC Proper user ID for a valid email', async () => {
      const mockSession = { user: { email: 'teacher@test.com' } };
      getSession.mockResolvedValue(mockSession);

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: { userId: 'fcc-proper-user-123' }
        })
      });

      const result = await getFccProperUserIdByEmail('student@test.com');

      expect(result).toBe('fcc-proper-user-123');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/fcc-proxy'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('student@test.com')
        })
      );
    });

    it('should return null if user not found in FCC Proper', async () => {
      const mockSession = { user: { email: 'teacher@test.com' } };
      getSession.mockResolvedValue(mockSession);

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: { userId: null }
        })
      });

      const result = await getFccProperUserIdByEmail('nonexistent@test.com');

      expect(result).toBeNull();
    });

    it('should throw error if not authenticated', async () => {
      getSession.mockResolvedValue(null);

      await expect(
        getFccProperUserIdByEmail('student@test.com')
      ).rejects.toThrow('User not authenticated');
    });

    it('should throw error if API request fails', async () => {
      const mockSession = { user: { email: 'teacher@test.com' } };
      getSession.mockResolvedValue(mockSession);

      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(
        getFccProperUserIdByEmail('student@test.com')
      ).rejects.toThrow('API request failed with status 500');
    });

    it('should include inClassroom flag in request', async () => {
      const mockSession = { user: { email: 'teacher@test.com' } };
      getSession.mockResolvedValue(mockSession);

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: { userId: 'fcc-proper-user-123' }
        })
      });

      await getFccProperUserIdByEmail('student@test.com');

      const callArgs = global.fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.options.inClassroom).toBe(true);
    });
  });

  describe('getStudentDataByUserIds', () => {
    it('should fetch student data for multiple user IDs', async () => {
      const mockSession = { user: { email: 'teacher@test.com' } };
      getSession.mockResolvedValue(mockSession);

      const mockStudentData = {
        'user-id-1': [{ id: 'challenge-1', completedDate: '2024-01-15' }],
        'user-id-2': [{ id: 'challenge-2', completedDate: '2024-01-16' }]
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: mockStudentData
        })
      });

      const result = await getStudentDataByUserIds(['user-id-1', 'user-id-2']);

      expect(result).toEqual(mockStudentData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/fcc-proxy'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('user-id-1')
        })
      );
    });

    it('should return empty object if no student data found', async () => {
      const mockSession = { user: { email: 'teacher@test.com' } };
      getSession.mockResolvedValue(mockSession);

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {}
        })
      });

      const result = await getStudentDataByUserIds(['user-id-1']);

      expect(result).toEqual({});
    });

    it('should throw error if userIds is empty', async () => {
      await expect(getStudentDataByUserIds([])).rejects.toThrow(
        'userIds must be a non-empty array'
      );
    });

    it('should throw error if userIds is not an array', async () => {
      await expect(getStudentDataByUserIds('user-id-1')).rejects.toThrow(
        'userIds must be a non-empty array'
      );
    });

    it('should throw error if more than 50 user IDs provided', async () => {
      const manyIds = Array.from({ length: 51 }, (_, i) => `user-id-${i}`);

      await expect(getStudentDataByUserIds(manyIds)).rejects.toThrow(
        'Maximum 50 user IDs allowed per request'
      );
    });

    it('should work with exactly 50 user IDs', async () => {
      const mockSession = { user: { email: 'teacher@test.com' } };
      getSession.mockResolvedValue(mockSession);

      const fiftyIds = Array.from({ length: 50 }, (_, i) => `user-id-${i}`);

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {}
        })
      });

      await expect(getStudentDataByUserIds(fiftyIds)).resolves.not.toThrow();
    });

    it('should throw error if not authenticated', async () => {
      getSession.mockResolvedValue(null);

      await expect(getStudentDataByUserIds(['user-id-1'])).rejects.toThrow(
        'User not authenticated'
      );
    });

    it('should throw error if API request fails', async () => {
      const mockSession = { user: { email: 'teacher@test.com' } };
      getSession.mockResolvedValue(mockSession);

      global.fetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      });

      await expect(getStudentDataByUserIds(['user-id-1'])).rejects.toThrow(
        'API request failed with status 400'
      );
    });

    it('should include inClassroom flag in request', async () => {
      const mockSession = { user: { email: 'teacher@test.com' } };
      getSession.mockResolvedValue(mockSession);

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {}
        })
      });

      await getStudentDataByUserIds(['user-id-1']);

      const callArgs = global.fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.options.inClassroom).toBe(true);
    });

    it('should handle student data with multiple challenges', async () => {
      const mockSession = { user: { email: 'teacher@test.com' } };
      getSession.mockResolvedValue(mockSession);

      const mockStudentData = {
        'user-id-1': [
          { id: 'challenge-1', completedDate: '2024-01-15' },
          { id: 'challenge-2', completedDate: '2024-01-16' },
          { id: 'challenge-3', completedDate: '2024-01-17' }
        ]
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: mockStudentData
        })
      });

      const result = await getStudentDataByUserIds(['user-id-1']);

      expect(result['user-id-1'].length).toBe(3);
      expect(result['user-id-1'][0].id).toBe('challenge-1');
    });
  });

  describe('fetchFromFCC', () => {
    it('should use relative URL on client side', async () => {
      const mockSession = { user: { email: 'teacher@test.com' } };
      getSession.mockResolvedValue(mockSession);

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: {} })
      });

      // Simulate client side by ensuring window is defined
      await fetchFromFCC({ targetUrl: '/api/test' });

      const callUrl = global.fetch.mock.calls[0][0];
      expect(callUrl).toBe('/api/fcc-proxy');
    });

    it('should use absolute URL on server side', async () => {
      const mockSession = { user: { email: 'teacher@test.com' } };
      getSession.mockResolvedValue(mockSession);

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: {} })
      });

      // Pass empty context (server side)
      await fetchFromFCC({ targetUrl: '/api/test' }, {});

      const callUrl = global.fetch.mock.calls[0][0];
      expect(callUrl).toContain('http://localhost:3001/api/fcc-proxy');
    });

    it('should include credentials in fetch request', async () => {
      const mockSession = { user: { email: 'teacher@test.com' } };
      getSession.mockResolvedValue(mockSession);

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: {} })
      });

      await fetchFromFCC({ targetUrl: '/api/test' });

      const fetchOptions = global.fetch.mock.calls[0][1];
      expect(fetchOptions.credentials).toBe('include');
    });

    it('should set correct content-type header', async () => {
      const mockSession = { user: { email: 'teacher@test.com' } };
      getSession.mockResolvedValue(mockSession);

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: {} })
      });

      await fetchFromFCC({ targetUrl: '/api/test' });

      const fetchOptions = global.fetch.mock.calls[0][1];
      expect(fetchOptions.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('integration scenarios', () => {
    it('should perform complete two-call validation flow', async () => {
      const mockSession = { user: { email: 'teacher@test.com' } };
      getSession.mockResolvedValue(mockSession);

      // First call: get user IDs by email
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: { userId: 'fcc-user-123' } })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: { userId: 'fcc-user-456' } })
        })
        // Second call: get student data for user IDs
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              'fcc-user-123': [
                { id: 'challenge-1', completedDate: '2024-01-15' }
              ],
              'fcc-user-456': [
                { id: 'challenge-2', completedDate: '2024-01-16' }
              ]
            }
          })
        });

      // Simulate teacher getting user IDs for two students
      const userId1 = await getFccProperUserIdByEmail('student1@test.com');
      const userId2 = await getFccProperUserIdByEmail('student2@test.com');

      expect(userId1).toBe('fcc-user-123');
      expect(userId2).toBe('fcc-user-456');

      // Then get student data for those user IDs
      const studentData = await getStudentDataByUserIds([userId1, userId2]);

      expect(studentData['fcc-user-123'][0].id).toBe('challenge-1');
      expect(studentData['fcc-user-456'][0].id).toBe('challenge-2');
    });

    it('should handle mixed success/failure in email lookups', async () => {
      const mockSession = { user: { email: 'teacher@test.com' } };
      getSession.mockResolvedValue(mockSession);

      // First email exists, second doesn't
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: { userId: 'fcc-user-123' } })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: { userId: null } })
        });

      const userId1 = await getFccProperUserIdByEmail('student1@test.com');
      const userId2 = await getFccProperUserIdByEmail('student2@test.com');

      expect(userId1).toBe('fcc-user-123');
      expect(userId2).toBeNull();
    });
  });
});
