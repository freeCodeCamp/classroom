import { fetchStudentData } from './fetchStudentData';

/**
 * Gets individual student data by email from mock data
 * @param {string} studentEmail - Student email address
 * @returns {Promise<Object>} Student data object
 *
 * NOTE: This is a mock data function used for testing.
 * For production, use FCC Proper API with fccProperUserId.
 */
export async function getIndividualStudentData(studentEmail) {
  let studentData = await fetchStudentData();
  let individualStudentObj = {};
  studentData.forEach(individualStudentDetailsObj => {
    if (individualStudentDetailsObj.email === studentEmail) {
      individualStudentObj = individualStudentDetailsObj;
    }
  });

  return individualStudentObj;
}
