import { getAllSuperblockTitlesAndDashedNames } from './getAllSuperblockTitlesAndDashedNames';

/**
 * Maps an array of superblock dashed names to their readable titles.
 * @param {Array<string>} fccCertificationsDashedNames - Array of superblock dashed names
 * @returns {Promise<Array<string>>} Array of readable superblock titles
 */
export async function getSuperblockTitlesInClassroomByIndex(
  fccCertificationsDashedNames
) {
  let allSuperblockTitles = await getAllSuperblockTitlesAndDashedNames();

  return fccCertificationsDashedNames.map(dashedName => {
    const superblock = allSuperblockTitles.find(
      x => x.superblockDashedName === dashedName
    );
    return superblock?.superblockReadableTitle || dashedName;
  });
}
