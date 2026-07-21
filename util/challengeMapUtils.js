import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getCanonicalChallengeMapLocation } from './challengeMapHelpers';

/**
 * Challenge map utilities
 * -----------------------
 * The challenge map (`data/challengeMap.json`) is a flat lookup that maps every
 * freeCodeCamp challenge id to the superblock(s) and block(s) it belongs to,
 * plus its human-readable name. It is generated from the FCC Proper GraphQL
 * curriculum database by `scripts/build-challenge-map-graphql.mjs` (see the
 * README "Challenge map" section for how/when to regenerate it).
 *
 * Why Classroom needs it: FCC Proper reports a student's progress as a flat
 * list of completed challenge ids, with no curriculum structure attached. The
 * teacher dashboard, however, needs to show that progress grouped by
 * certification and block. These helpers bridge the two: they look each
 * completed challenge id up in the map and re-nest the flat data into the
 * `{ certifications: [{ cert: { blocks: [...] } }] }` shape the dashboard
 * renders.
 *
 * Every map entry stores its associations as arrays (`superblocks`, `blocks`)
 * because a challenge can be reused across several superblocks/blocks. We
 * collapse each challenge to a single canonical location via
 * `getCanonicalChallengeMapLocation` (first element wins).
 */

// The static map is loaded lazily so importing this module does not require the
// generated file to exist. Synthetic callers/tests pass their own map; only the
// default-map path below touches the filesystem.
let staticChallengeMap = null;
function loadStaticChallengeMap() {
  if (!staticChallengeMap) {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    staticChallengeMap = JSON.parse(
      readFileSync(join(__dirname, '../data/challengeMap.json'), 'utf8')
    );
  }
  return staticChallengeMap;
}

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
  const mapToUse = curriculumMap || loadStaticChallengeMap();
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
    // Collapse the (possibly multi-superblock) entry to a single canonical
    // certification/block for dashboard grouping. See challengeMapHelpers.js.
    const name = mapEntry.name;
    const { certification, block } = getCanonicalChallengeMapLocation(mapEntry);
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
