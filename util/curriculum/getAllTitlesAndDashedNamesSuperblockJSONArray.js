import { AVAILABLE_SUPER_BLOCKS } from './constants';

/**
 * Fetches all available superblocks from FCC v1 API
 * @returns {Promise<Array>} Array of superblock objects with dashedName and title
 */
export async function getAllTitlesAndDashedNamesSuperblockJSONArray() {
  // calls this API https://www.freecodecamp.org/curriculum-data/v1/available-superblocks.json
  const superblocksres = await fetch(AVAILABLE_SUPER_BLOCKS);

  // the response of this structure is [ superblocks: [ {}, {}, ...etc] ]
  const curriculumData = await superblocksres.json();

  // which is why we return curriculumData.superblocks
  return curriculumData.superblocks;
}
