import challengeMap from '../data/challengeMap.json';

/**
 * Resolves a full FCC Proper student data object (from the proxy) to the dashboard format.
 * @param {Object} studentDataFromFCC - { email1: [completedChallenges], email2: [completedChallenges], ... }
 * @returns {Array} - Array of student objects: { email, certifications: [...] }
 */
export function resolveAllStudentsToDashboardFormat(studentDataFromFCC) {
  if (!studentDataFromFCC || typeof studentDataFromFCC !== 'object') return [];
  return Object.entries(studentDataFromFCC).map(
    ([email, completedChallenges]) => ({
      email,
      ...buildStudentDashboardData(completedChallenges, challengeMap)
    })
  );
}
/**
 * Transforms a student's flat completed challenge array into the nested dashboard format.
 * @param {Array} completedChallenges - Array of completed challenge objects (with id, completedDate, etc.)
 * @param {Object} challengeMap - The challenge map object from /api/build-challenge-map
 * @returns {Object} - Nested structure: { certifications: [ { [certName]: { blocks: [ { [blockName]: { completedChallenges: [...] } } ] } } ] }
 */
export function buildStudentDashboardData(completedChallenges, challengeMap) {
  const result = { certifications: [] };
  const certMap = {};

  completedChallenges.forEach(challenge => {
    const mapEntry = challengeMap[challenge.id];
    if (!mapEntry) {
      // DEBUG: Print missing challenge IDs, confirm with curriculum team if these challenge IDs are no longer valid.
      // console.warn('Challenge ID not found in challengeMap:', challenge.id);
      return; // skip unknown ids
    }
    const { certification, block, name } = mapEntry;
    if (!certMap[certification]) {
      certMap[certification] = { blocks: {} };
    }
    if (!certMap[certification].blocks[block]) {
      certMap[certification].blocks[block] = { completedChallenges: [] };
    }
    certMap[certification].blocks[block].completedChallenges.push({
      ...challenge,
      challengeName: name
    });
  });

  // Convert to the expected nested array format
  for (const cert in certMap) {
    const certObj = {};
    certObj[cert] = {
      blocks: Object.entries(certMap[cert].blocks).map(
        ([blockName, blockObj]) => ({
          [blockName]: blockObj
        })
      )
    };
    result.certifications.push(certObj);
  }

  return result;
}
