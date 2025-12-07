/**
 * Checks if student has progress data for superblocks selected by teacher
 * @param {Array} studentJSON - Array of student data objects
 * @param {Array} superblockDashboardObj - Dashboard object with superblock data
 * @returns {Array<Array<boolean>>} 2D boolean array indicating enrollment status
 *
 * Since we are using hard-coded mock data at the moment, this check allows to anticipate the
 * correct response, however, when the student API data goes live, it will be assumed that it will
 * only provide student data on the specified superblocks selected by the teacher
 */
export function checkIfStudentHasProgressDataForSuperblocksSelectedByTeacher(
  studentJSON,
  superblockDashboardObj
) {
  // Returns a boolean matrix which checks to see enrollment in at least 1 superblock (at least 1 because in the GlobalDashboard component we calculate the cumulative progress)

  let superblockTitlesSelectedByTeacher = [];

  superblockDashboardObj.forEach(superblockObj => {
    superblockTitlesSelectedByTeacher.push(superblockObj[0].superblock);
  });

  let studentResponseDataHasSuperblockBooleanArray = [];
  studentJSON.forEach(studentDetails => {
    let individualStudentEnrollmentStatus = [];
    studentDetails.certifications.forEach(certObj => {
      let studentIsEnrolledSuperblock = false;
      if (superblockTitlesSelectedByTeacher.includes(Object.keys(certObj)[0])) {
        studentIsEnrolledSuperblock = true;
      }
      individualStudentEnrollmentStatus.push(studentIsEnrolledSuperblock);
    });
    studentResponseDataHasSuperblockBooleanArray.push(
      individualStudentEnrollmentStatus
    );
  });

  return studentResponseDataHasSuperblockBooleanArray;
}
