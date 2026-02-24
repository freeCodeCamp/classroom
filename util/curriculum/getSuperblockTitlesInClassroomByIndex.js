import { getAllSuperblockTitlesAndDashedNames } from './getAllSuperblockTitlesAndDashedNames';

/**
 * Maps an array of superblock indices to their readable titles
 * The reason we use an array of indices is because that is how the data is stored in the Classroom table
 * after class creation, see ClassInviteTable.js and modal.js component for more context.
 * @param {Array<number>} fccCertificationsArrayOfIndicies - Array of superblock indices
 * @returns {Promise<Array<string>>} Array of readable superblock titles
 */
export async function getSuperblockTitlesInClassroomByIndex(
  fccCertificationsArrayOfIndicies
) {
  let allSuperblockTitles = await getAllSuperblockTitlesAndDashedNames();

  return fccCertificationsArrayOfIndicies.map(
    x => allSuperblockTitles[x].superblockReadableTitle
  );
}
