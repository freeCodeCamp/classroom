/**
 * Fetches student data from the mock data URL
 * @returns {Promise<{error: string|null, data: Array|null, status?: number}>}
 *
 * NOTE: This is a mock data function used for testing.
 * In production, use FCC Proper API with fccProperUserIds.
 */
export async function fetchStudentData() {
  if (!process.env.MOCK_USER_DATA_URL) {
    console.warn('MOCK_USER_DATA_URL is not defined.');
    return { error: 'MISSING_URL', data: null };
  }
  try {
    const response = await fetch(process.env.MOCK_USER_DATA_URL);
    if (!response.ok) {
      return { error: 'FETCH_FAILED', status: response.status, data: null };
    }
    return { error: null, data: await response.json() };
  } catch {
    return { error: 'NETWORK_ERROR', data: null };
  }
}
