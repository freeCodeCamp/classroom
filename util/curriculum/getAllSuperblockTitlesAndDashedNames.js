import { getAllTitlesAndDashedNamesSuperblockJSONArray } from './getAllTitlesAndDashedNamesSuperblockJSONArray';

/**
 * Gets all superblock dashedNames and readable titles
 * @returns {Promise<Array>} Array of objects with superblockDashedName and superblockReadableTitle
 */
export async function getAllSuperblockTitlesAndDashedNames() {
  let superblockTitleAndDashedNameJSONArray =
    await getAllTitlesAndDashedNamesSuperblockJSONArray();

  let superblockDashedNameToTitleArrayMapping = [];
  superblockTitleAndDashedNameJSONArray.forEach(
    superblockDashedNameAndTitleObject => {
      let superblockDashedNameToTitleArray = {
        superblockDashedName: '',
        superblockReadableTitle: ''
      };
      let superblockDashedName = superblockDashedNameAndTitleObject.dashedName;
      let superblockTitle = superblockDashedNameAndTitleObject.title;
      superblockDashedNameToTitleArray.superblockDashedName =
        superblockDashedName;
      superblockDashedNameToTitleArray.superblockReadableTitle =
        superblockTitle;
      superblockDashedNameToTitleArrayMapping.push(
        superblockDashedNameToTitleArray
      );
    }
  );
  return superblockDashedNameToTitleArrayMapping;
}
