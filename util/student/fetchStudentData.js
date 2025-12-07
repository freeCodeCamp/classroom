/**
 * Fetches student data from the mock data URL
 * @returns {Promise<Array>} Array of student objects
 *
 * NOTE: This is a mock data function used for testing.
 * In production, use FCC Proper API with fccProperUserIds.
 */
export async function fetchStudentData() {
  let data = await fetch(process.env.MOCK_USER_DATA_URL);
  return data.json();
}
