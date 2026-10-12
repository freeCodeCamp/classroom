const fetchMock = vi.fn();
global.fetch = fetchMock;

vi.mock('../../util/challengeMapUtils', () => ({
  resolveAllStudentsToDashboardFormat: vi.fn(
    (emailKeyedData: Record<string, unknown>) =>
      Object.entries(emailKeyedData).map(([email, challenges]) => ({
        email,
        certifications: challenges
      }))
  )
}));

import { fetchUserIdByEmail, fetchUserData } from '../../util/fcc-api';
import { fetchClassroomStudentData } from '../../util/student/fetchStudentData';
import { resolveAllStudentsToDashboardFormat } from '../../util/challengeMapUtils';

describe('FCC API handshake', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.FCC_API_URL = 'http://localhost:3000';
    process.env.TPA_API_BEARER_TOKEN = 'test-bearer-token';
  });

  afterEach(() => {
    delete process.env.FCC_API_URL;
    delete process.env.TPA_API_BEARER_TOKEN;
  });

  // ---------------------------------------------------------------------------
  // fetchUserIdByEmail — /apps/classroom/get-user-id
  // ---------------------------------------------------------------------------
  describe('fetchUserIdByEmail', () => {
    it('POSTs to the correct get-user-id endpoint with the email in the body', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ userId: 'abc123' })
      });

      await fetchUserIdByEmail('student@example.com');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/apps/classroom/get-user-id',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'student@example.com' })
        })
      );
    });

    it('includes the Bearer token in the Authorization header', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ userId: 'abc123' })
      });

      await fetchUserIdByEmail('student@example.com');

      const [, options] = fetchMock.mock.calls[0];
      expect(options.headers['Authorization']).toBe('Bearer test-bearer-token');
      expect(options.headers['Content-Type']).toBe('application/json');
    });

    it('returns the userId from the response', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ userId: 'user_objectid_abc123' })
      });

      const result = await fetchUserIdByEmail('student@example.com');

      expect(result).toEqual({ userId: 'user_objectid_abc123' });
    });

    it('returns an empty string userId when the user has not opted in to classroom mode', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ userId: '' })
      });

      const result = await fetchUserIdByEmail('nooptin@example.com');

      expect(result.userId).toBe('');
    });

    it('throws when TPA_API_BEARER_TOKEN env var is missing', async () => {
      delete process.env.TPA_API_BEARER_TOKEN;

      await expect(fetchUserIdByEmail('student@example.com')).rejects.toThrow(
        'TPA_API_BEARER_TOKEN is not set'
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('throws when the FCC API returns a non-ok response', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ error: 'Invalid token' })
      });

      await expect(fetchUserIdByEmail('student@example.com')).rejects.toThrow(
        'Failed to look up fCC user ID'
      );
    });

    it('throws when the FCC API returns a 500 with no parseable JSON body', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new SyntaxError('not json');
        }
      });

      await expect(fetchUserIdByEmail('student@example.com')).rejects.toThrow(
        'Failed to look up fCC user ID'
      );
    });
  });

  // ---------------------------------------------------------------------------
  // fetchUserData — /apps/classroom/get-user-data
  // ---------------------------------------------------------------------------
  describe('fetchUserData', () => {
    it('returns { data: {} } immediately for an empty userIds array without hitting the network', async () => {
      const result = await fetchUserData([]);

      expect(result).toEqual({ data: {} });
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('returns { data: {} } for null userIds without hitting the network', async () => {
      const result = await fetchUserData(null);

      expect(result).toEqual({ data: {} });
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('POSTs to the correct get-user-data endpoint with userIds in the body', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ data: { uid1: [] } })
      });

      await fetchUserData(['uid1', 'uid2']);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/apps/classroom/get-user-data',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ userIds: ['uid1', 'uid2'] })
        })
      );
    });

    it('includes the Bearer token in the Authorization header', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ data: {} })
      });

      await fetchUserData(['uid1']);

      const [, options] = fetchMock.mock.calls[0];
      expect(options.headers['Authorization']).toBe('Bearer test-bearer-token');
    });

    it('returns challenge completion data keyed by fCC user ID', async () => {
      const mockData = {
        uid1: [{ id: 'bd7123c8c441eddfaeb5bdef', completedDate: 1700000000000 }]
      };
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockData })
      });

      const result = await fetchUserData(['uid1']);

      expect(result.data).toEqual(mockData);
    });

    it('splits requests into batches of 50 when more than 50 user IDs are provided', async () => {
      const userIds = Array.from({ length: 55 }, (_, i) => `uid${i}`);
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ data: {} })
      });

      await fetchUserData(userIds);

      expect(global.fetch).toHaveBeenCalledTimes(2);
      const firstBatchBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      const secondBatchBody = JSON.parse(fetchMock.mock.calls[1][1].body);
      expect(firstBatchBody.userIds).toHaveLength(50);
      expect(secondBatchBody.userIds).toHaveLength(5);
    });

    it('sends exactly one request when userIds length equals the batch size limit (50)', async () => {
      const userIds = Array.from({ length: 50 }, (_, i) => `uid${i}`);
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ data: {} })
      });

      await fetchUserData(userIds);

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('merges batch results into a single data object', async () => {
      const userIds = Array.from({ length: 55 }, (_, i) => `uid${i}`);
      const batch1Data = Object.fromEntries(
        userIds.slice(0, 50).map(id => [id, []])
      );
      const batch2Data = Object.fromEntries(
        userIds.slice(50).map(id => [id, []])
      );

      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: batch1Data })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: batch2Data })
        });

      const result = await fetchUserData(userIds);

      expect(Object.keys(result.data)).toHaveLength(55);
      expect(result.data).toMatchObject(batch1Data);
      expect(result.data).toMatchObject(batch2Data);
    });

    it('throws when the FCC API returns a non-ok response', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      fetchMock.mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({ error: 'Forbidden' })
      });

      await expect(fetchUserData(['uid1'])).rejects.toThrow(
        'Failed to fetch student data from fCC API'
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'get-user-data failed',
        403,
        'Forbidden'
      );
      consoleSpy.mockRestore();
    });
  });

  // ---------------------------------------------------------------------------
  // fetchClassroomStudentData — orchestrates fetchUserData + dashboard mapping
  // ---------------------------------------------------------------------------
  describe('fetchClassroomStudentData', () => {
    it('returns an empty array when no students have a linked fccProperUserId', async () => {
      const students = [
        { id: 's1', email: 'a@test.com', fccProperUserId: null },
        { id: 's2', email: 'b@test.com', fccProperUserId: null }
      ];

      const result = await fetchClassroomStudentData(students);

      expect(result).toEqual([]);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('only requests data for students who have a linked fccProperUserId', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ data: { 'fcc-uid-1': [] } })
      });

      const students = [
        { id: 's1', email: 'linked@test.com', fccProperUserId: 'fcc-uid-1' },
        { id: 's2', email: 'unlinked@test.com', fccProperUserId: null }
      ];

      await fetchClassroomStudentData(students);

      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body.userIds).toEqual(['fcc-uid-1']);
    });

    it('translates fccProperUserId back to student email before passing data to the dashboard formatter', async () => {
      const completedChallenges = [
        { id: 'bd7123c8c441eddfaeb5bdef', completedDate: 1700000000000 }
      ];
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: { 'fcc-uid-1': completedChallenges }
        })
      });

      const students = [
        {
          id: 's1',
          email: 'student@test.com',
          fccProperUserId: 'fcc-uid-1'
        }
      ];

      await fetchClassroomStudentData(students);

      expect(resolveAllStudentsToDashboardFormat).toHaveBeenCalledWith(
        expect.objectContaining({
          'student@test.com': completedChallenges
        })
      );
    });

    it('does not include fCC user IDs as keys in the dashboard formatter input', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: { 'fcc-uid-1': [] }
        })
      });

      const students = [
        { id: 's1', email: 'student@test.com', fccProperUserId: 'fcc-uid-1' }
      ];

      await fetchClassroomStudentData(students);

      const formatterArg = vi.mocked(resolveAllStudentsToDashboardFormat).mock
        .calls[0][0] as unknown as Record<string, unknown>;
      // Use Object.keys to avoid Jest's dot-notation interpretation of email addresses
      expect(Object.keys(formatterArg)).not.toContain('fcc-uid-1');
      expect(Object.keys(formatterArg)).toContain('student@test.com');
    });

    it('returns the dashboard-formatted result from resolveAllStudentsToDashboardFormat', async () => {
      const challenges = [
        { id: 'bd7123c8c441eddfaeb5bdef', completedDate: 1700000000000 }
      ];
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ data: { 'fcc-uid-1': challenges } })
      });

      const students = [
        { id: 's1', email: 'student@test.com', fccProperUserId: 'fcc-uid-1' }
      ];

      const result = await fetchClassroomStudentData(students);

      // Our mock resolveAllStudentsToDashboardFormat returns { email, certifications: challenges }
      expect(result).toEqual([
        { email: 'student@test.com', certifications: challenges }
      ]);
    });

    it('drops fCC user IDs that do not map to any classroom student email', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({
          // FCC returns an extra ID not in our students list
          data: { 'fcc-uid-1': [], 'unexpected-uid': [] }
        })
      });

      const students = [
        { id: 's1', email: 'student@test.com', fccProperUserId: 'fcc-uid-1' }
      ];

      await fetchClassroomStudentData(students);

      const formatterArg = vi.mocked(resolveAllStudentsToDashboardFormat).mock
        .calls[0][0] as unknown as Record<string, unknown>;
      expect(Object.keys(formatterArg)).toEqual(['student@test.com']);
    });
  });
});
