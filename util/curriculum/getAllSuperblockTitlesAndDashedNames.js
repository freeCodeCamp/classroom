import { getAvailableSuperblocks } from './fetchCurriculum';

/**
 * Gets all superblock dashedNames and readable titles
 * @returns {Promise<Array>} Array of objects with superblockDashedName and superblockReadableTitle
 */
export async function getAllSuperblockTitlesAndDashedNames() {
  const superblocks = await getAvailableSuperblocks();
  return superblocks.map(sb => ({
    superblockDashedName: sb.dashedName,
    superblockReadableTitle: sb.title
  }));
}
