import { fetchStudentData } from './fetchStudentData';
import type { StudentDashboardData } from '../../types/student';

/**
 * Gets individual student data by email from mock data
 * @param {string} studentEmail - Student email address
 * @returns {Promise<Object|null>} Student data object, or null when not found
 *
 * NOTE: This is a mock data function used for testing.
 * For production, use FCC Proper API with fccProperUserId.
 */
export async function getIndividualStudentData(
  studentEmail: string
): Promise<StudentDashboardData | null> {
  const { error, data: studentData } = await fetchStudentData();
  if (error) {
    throw new Error(`Unable to load mock student data: ${error}`);
  }
  let individualStudentObj: StudentDashboardData | null = null;
  (studentData ?? []).forEach(individualStudentDetailsObj => {
    if (individualStudentDetailsObj.email === studentEmail) {
      individualStudentObj = individualStudentDetailsObj;
    }
  });

  return individualStudentObj;
}
