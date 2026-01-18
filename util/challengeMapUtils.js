import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const challengeMap = JSON.parse(
  readFileSync(join(__dirname, '../data/challengeMap.json'), 'utf8')
);

/**
 * Resolves a full FCC Proper student data object (from the proxy) to the dashboard format.
 * @param {Object} studentDataFromFCC - { email1: [completedChallenges], email2: [completedChallenges], ... }
 * @param {Object} [curriculumMap] - Optional curriculum map from GraphQL. If not provided, uses static challengeMap.json
 * @returns {Array} - Array of student objects: { email, certifications: [...] }
 */
export function resolveAllStudentsToDashboardFormat(
  studentDataFromFCC,
  curriculumMap = null
) {
  if (!studentDataFromFCC || typeof studentDataFromFCC !== 'object') return [];
  const mapToUse = curriculumMap || challengeMap;
  return Object.entries(studentDataFromFCC).map(
    ([email, completedChallenges]) => ({
      email,
      ...buildStudentDashboardData(completedChallenges, mapToUse)
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
    // Use first superblock/block as canonical for dashboard grouping
    const name = mapEntry.name;
    const certification =
      mapEntry.certification || (mapEntry.superblocks || [])[0];
    const block = mapEntry.block || (mapEntry.blocks || [])[0];
    if (!certification || !block) {
      return;
    }
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
