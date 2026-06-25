global.fetch = jest.fn();

// Must be declared before require() calls so jest hoisting can intercept
// the dynamic import inside fetchClassroomStudentData.
jest.mock('../../util/challengeMapUtils', () => ({
  resolveAllStudentsToDashboardFormat: jest.fn(emailKeyedData =>
    Object.entries(emailKeyedData).map(([email, challenges]) => ({
      email,
      certifications: challenges
    }))
  )
}));

const { fetchUserData } = require('../../util/fcc-api');
const {
  fetchClassroomStudentData
} = require('../../util/student/fetchStudentData');
const {
  resolveAllStudentsToDashboardFormat
} = require('../../util/challengeMapUtils');

describe('FCC API handshake', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.FCC_API_URL = 'http://localhost:3000';
    process.env.TPA_API_BEARER_TOKEN = 'test-bearer-token';
  });

  afterEach(() => {
    delete process.env.FCC_API_URL;
    delete process.env.TPA_API_BEARER_TOKEN;
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
      global.fetch.mockResolvedValue({
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
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: {} })
      });

      await fetchUserData(['uid1']);

      const [, options] = global.fetch.mock.calls[0];
      expect(options.headers['Authorization']).toBe('Bearer test-bearer-token');
    });

    it('returns challenge completion data keyed by fCC user ID', async () => {
      const mockData = {
        uid1: [{ id: 'bd7123c8c441eddfaeb5bdef', completedDate: 1700000000000 }]
      };
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockData })
      });

      const result = await fetchUserData(['uid1']);

      expect(result.data).toEqual(mockData);
    });

    it('splits requests into batches of 50 when more than 50 user IDs are provided', async () => {
      const userIds = Array.from({ length: 55 }, (_, i) => `uid${i}`);
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: {} })
      });

      await fetchUserData(userIds);

      expect(global.fetch).toHaveBeenCalledTimes(2);
      const firstBatchBody = JSON.parse(global.fetch.mock.calls[0][1].body);
      const secondBatchBody = JSON.parse(global.fetch.mock.calls[1][1].body);
      expect(firstBatchBody.userIds).toHaveLength(50);
      expect(secondBatchBody.userIds).toHaveLength(5);
    });

    it('sends exactly one request when userIds length equals the batch size limit (50)', async () => {
      const userIds = Array.from({ length: 50 }, (_, i) => `uid${i}`);
      global.fetch.mockResolvedValue({
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

      global.fetch
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
      global.fetch.mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({ error: 'Forbidden' })
      });

      await expect(fetchUserData(['uid1'])).rejects.toThrow(
        'Failed to fetch student data from fCC API'
      );
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
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: { 'fcc-uid-1': [] } })
      });

      const students = [
        { id: 's1', email: 'linked@test.com', fccProperUserId: 'fcc-uid-1' },
        { id: 's2', email: 'unlinked@test.com', fccProperUserId: null }
      ];

      await fetchClassroomStudentData(students);

      const body = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(body.userIds).toEqual(['fcc-uid-1']);
    });

    it('translates fccProperUserId back to student email before passing data to the dashboard formatter', async () => {
      const completedChallenges = [
        { id: 'bd7123c8c441eddfaeb5bdef', completedDate: 1700000000000 }
      ];
      global.fetch.mockResolvedValue({
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
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: { 'fcc-uid-1': [] }
        })
      });

      const students = [
        { id: 's1', email: 'student@test.com', fccProperUserId: 'fcc-uid-1' }
      ];

      await fetchClassroomStudentData(students);

      const formatterArg = resolveAllStudentsToDashboardFormat.mock.calls[0][0];
      // Use Object.keys to avoid Jest's dot-notation interpretation of email addresses
      expect(Object.keys(formatterArg)).not.toContain('fcc-uid-1');
      expect(Object.keys(formatterArg)).toContain('student@test.com');
    });

    it('returns the dashboard-formatted result from resolveAllStudentsToDashboardFormat', async () => {
      const challenges = [
        { id: 'bd7123c8c441eddfaeb5bdef', completedDate: 1700000000000 }
      ];
      global.fetch.mockResolvedValue({
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
      global.fetch.mockResolvedValue({
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

      const formatterArg = resolveAllStudentsToDashboardFormat.mock.calls[0][0];
      expect(Object.keys(formatterArg)).toEqual(['student@test.com']);
    });
  });
});
