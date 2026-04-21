export const CURRICULUM_GRAPHQL_ENDPOINT =
  'https://curriculum-db.freecodecamp.org/graphql';

/* TODO: Remove these once the graphql database has a filter available for these sections.
    
query GetSuperblocksForClassroom {
  superblocks {
    dashedName
    name
    isCertification
    isLegacy            <---- Add this to the database for LEGACY_SUPERBLOCK_DASHED_NAMES
    isJobPrep           <---- Add this to the database for INTERVIEW_PREP_SUPERBLOCK_DASHED_NAMES
  }
}
  
  
  
  */
export const LEGACY_SUPERBLOCK_DASHED_NAMES = new Set([
  'responsive-web-design',
  'javascript-algorithms-and-data-structures',
  'front-end-development-libraries',
  'data-visualization',
  'back-end-development-and-apis',
  'quality-assurance',
  'scientific-computing-with-python',
  'data-analysis-with-python',
  'information-security',
  'machine-learning-with-python',
  'relational-databases',
  'responsive-web-design-22',
  'javascript-algorithms-and-data-structures-22',
  'college-algebra-with-python',
  'full-stack-developer'
]);

export const INTERVIEW_PREP_SUPERBLOCK_DASHED_NAMES = new Set([
  'the-odin-project',
  'coding-interview-prep',
  'project-euler',
  'rosetta-code'
]);

// Used at save time (Prisma) to expand a teacher's cert selection into all
// required superblock dashedNames. Mirrors FCC Proper's certificationRequirements.
// When the GraphQL database adds a requirements field, this can be removed.
export const CERT_REQUIREMENTS = {
  'back-end-development-and-apis-v9': [
    'back-end-development-and-apis',
    'back-end-development-and-apis-v9'
  ],
  'full-stack-developer-v9': [
    'responsive-web-design-v9',
    'javascript-v9',
    'front-end-development-libraries-v9',
    'python-v9',
    'relational-databases-v9',
    'back-end-development-and-apis',
    'back-end-development-and-apis-v9',
    'full-stack-developer-v9'
  ]
};

/**
 * Returns the dashedNames to store in Prisma for a given teacher-selected superblock.
 * For certs with requirements, returns all required dashedNames.
 * For all others, returns just the superblock itself.
 */
export function getStoredSuperblocks(dashedName) {
  return CERT_REQUIREMENTS[dashedName] ?? [dashedName];
}
