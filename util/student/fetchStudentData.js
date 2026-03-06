import { fetchUserData } from '../fcc-api';
import { resolveAllStudentsToDashboardFormat } from '../challengeMapUtils';

/**
 * Fetches student completion data from the fCC API and transforms it into the
 * nested dashboard format expected by the classroom UI components.
 *
 * @param {Array<{id: string, email: string, fccProperUserId: string|null}>} students
 *   Classroom User records with at least id, email, and fccProperUserId.
 * @returns {Promise<Array<{email: string, certifications: Array}>>}
 *   Dashboard-ready student data, one entry per student that has a linked fCC account.
 */
export async function fetchClassroomStudentData(students) {
  const studentsWithFccId = students.filter(s => s.fccProperUserId);

  if (studentsWithFccId.length === 0) return [];

  const fccUserIds = studentsWithFccId.map(s => s.fccProperUserId);
  const { data } = await fetchUserData(fccUserIds);

  // Map fccProperUserId → email so resolveAllStudentsToDashboardFormat
  // can key the output by email (which the dashboard components expect).
  const idToEmail = {};
  for (const student of studentsWithFccId) {
    idToEmail[student.fccProperUserId] = student.email;
  }

  const emailKeyedData = {};
  for (const [fccId, challenges] of Object.entries(data)) {
    const email = idToEmail[fccId];
    if (email) {
      emailKeyedData[email] = challenges;
    }
  }

  return resolveAllStudentsToDashboardFormat(emailKeyedData);
}

/**
 * Fetches student data from the mock data URL (development only).
 * @returns {Promise<Array>} Array of student objects
 * @deprecated Use fetchClassroomStudentData with fCC API in production.
 */
export async function fetchStudentData() {
  let data = await fetch(process.env.MOCK_USER_DATA_URL);
  return data.json();
}
