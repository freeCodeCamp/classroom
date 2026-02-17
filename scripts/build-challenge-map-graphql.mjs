import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * Build challenge map from freeCodeCamp GraphQL Curriculum Database
 * 
 * This script fetches the complete curriculum structure from the GraphQL API
 * and generates a flat lookup map for challenge resolution.
 * 
 * Output format: { challengeId: { certification, block, name } }
 */

const GRAPHQL_ENDPOINT = 'https://curriculum-db.freecodecamp.org/graphql';
const OUTPUT_PATH = fileURLToPath(new URL('../data/challengeMap.json', import.meta.url));

const CHALLENGE_MAP_QUERY = `
  query GetChallengeMap {
    superblocks {
      dashedName
      name
      isCertification
      blockObjects {
        dashedName
        name
        challengeOrder {
          id
          title
        }
      }
    }
  }
`;

/**
 * Fetch curriculum data from GraphQL API
 */
async function fetchCurriculumData() {
  console.log('🔄 Fetching curriculum from GraphQL API...');
  console.log(`   Endpoint: ${GRAPHQL_ENDPOINT}`);
  
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: CHALLENGE_MAP_QUERY
    })
  });

  if (!response.ok) {
    throw new Error(
      `GraphQL request failed: ${response.status} ${response.statusText}`
    );
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(
      `GraphQL errors: ${JSON.stringify(result.errors, null, 2)}`
    );
  }

  return result.data;
}

/**
 * Transform GraphQL response into flat challenge map
 * 
 * Structure (using first occurrence as canonical):
 * {
 *   "challengeId": {
 *     "certification": "superblock-dashed-name",
 *     "block": "block-dashed-name",
 *     "name": "Challenge Title"
 *   }
 * }
 * 
 * Note: Challenges may appear in multiple superblocks, but we use the first occurrence.
 */
function buildChallengeMap(data) {
  console.log('🔨 Building challenge map...');
  
  const challengeMap = {};
  let totalChallenges = 0;
  let certificationCount = 0;
  let nonCertificationCount = 0;
  let duplicateCount = 0;

  for (const superblock of data.superblocks) {
    const superblockDashedName = superblock.dashedName;
    const isCertification = superblock.isCertification;

    if (isCertification) {
      certificationCount++;
    } else {
      nonCertificationCount++;
    }

    for (const block of superblock.blockObjects) {
      const blockDashedName = block.dashedName;

      for (const challenge of block.challengeOrder) {
        const challengeId = challenge.id;
        
        if (challengeMap[challengeId]) {
          // Add superblock if not already present
          if (!challengeMap[challengeId].superblocks.includes(superblockDashedName)) {
            challengeMap[challengeId].superblocks.push(superblockDashedName);
          }
          // Add block if not already present
          if (!challengeMap[challengeId].blocks.includes(blockDashedName)) {
            challengeMap[challengeId].blocks.push(blockDashedName);
          }
          duplicateCount++;
        } else {
          // First time seeing this challenge - create new entry
          challengeMap[challengeId] = {
            superblocks: [superblockDashedName],
            blocks: [blockDashedName],
            name: challenge.title
          };
        }
        
        totalChallenges++;
      }
    }
  }

  const uniqueChallenges = Object.keys(challengeMap).length;

  console.log(`   ✅ Processed ${data.superblocks.length} superblocks`);
  console.log(`      - ${certificationCount} certifications`);
  console.log(`      - ${nonCertificationCount} non-certifications`);
  console.log(`   ✅ Processed ${totalChallenges} challenge occurrences`);
  console.log(`      - ${uniqueChallenges} unique challenges`);
  console.log(`      - ${duplicateCount} shared across multiple superblocks`);

  return challengeMap;
}

/**
 * Main execution
 */
async function buildChallengeMapFromGraphQL() {
  try {
    console.log('🚀 Starting challenge map build from GraphQL...\n');

    // Fetch data from GraphQL API
    const data = await fetchCurriculumData();

    // Transform into flat challenge map
    const challengeMap = buildChallengeMap(data);

    // Ensure output directory exists
    await mkdir(dirname(OUTPUT_PATH), { recursive: true });
    // Write to file
    console.log(`\n💾 Writing challenge map to ${OUTPUT_PATH}...`);
    await writeFile(
      OUTPUT_PATH,
      JSON.stringify(challengeMap, null, 2)
    );

    console.log('✅ Challenge map successfully generated!\n');
    console.log(`   File: ${OUTPUT_PATH}`);
    console.log(`   Size: ${Object.keys(challengeMap).length} challenges`);

  } catch (err) {
    console.error('❌ Error building challenge map:', err);
    process.exit(1);
  }
}

// Execute
buildChallengeMapFromGraphQL();
