import { getAllTitlesAndDashedNamesSuperblockJSONArray } from './getAllTitlesAndDashedNamesSuperblockJSONArray';
import type { SuperblockTitleMapping } from '../../types/curriculum';

/**
 * Gets all superblock dashedNames and readable titles
 * @returns {Promise<Array>} Array of objects with superblockDashedName and superblockReadableTitle
 */
export async function getAllSuperblockTitlesAndDashedNames(): Promise<
  SuperblockTitleMapping[]
> {
  const superblockTitleAndDashedNameJSONArray =
    await getAllTitlesAndDashedNamesSuperblockJSONArray();

  const superblockDashedNameToTitleArrayMapping: SuperblockTitleMapping[] = [];
  superblockTitleAndDashedNameJSONArray.forEach(
    superblockDashedNameAndTitleObject => {
      const superblockDashedNameToTitleArray = {
        superblockDashedName: '',
        superblockReadableTitle: ''
      };
      const superblockDashedName =
        superblockDashedNameAndTitleObject.dashedName;
      const superblockTitle = superblockDashedNameAndTitleObject.title;
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
