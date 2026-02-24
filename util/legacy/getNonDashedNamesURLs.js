export const FCC_BASE_URL = 'https://www.freecodecamp.org/curriculum-data/v1/';
export const AVAILABLE_SUPER_BLOCKS =
  FCC_BASE_URL + 'available-superblocks.json';

/**
 * The parameter relates to the index found at the following API response
 * https://www.freecodecamp.org/curriculum-data/v1/available-superblocks.json
 *
 * Context: The way we know which superblocks are assigned in the classroom
 * is by storing the indicies in our DB (Prisma to access/write)
 * [see the Classroom table, then the fccCertifications column]
 * if you would like more context see the following file(s):
 * pages/classes/index.js and take a look at the Modal component
 * (components/modal.js), and also take a look at the
 * ClassInviteTable component (component/ClassInviteTable).
 * You can also search the codebase for the folling string to get more context
 * on the relation on the indicies stored in Prisma (unded the
 * fccCertifications column): "Select certifications:"
 */
export async function getNonDashedNamesURLs(fccCertificationsIndex) {
  const superblocksres = await fetch(AVAILABLE_SUPER_BLOCKS);

  const curriculumData = await superblocksres.json();

  return fccCertificationsIndex.map(
    x => curriculumData['superblocks'][x]['title']
  );
}
