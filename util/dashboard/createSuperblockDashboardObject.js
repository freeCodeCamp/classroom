import { getAllSuperblockTitlesAndDashedNames } from '../curriculum/getAllSuperblockTitlesAndDashedNames';
import { sortSuperBlocks } from './sortSuperBlocks';

/**
 * Creates a 2D dashboard array from the output of getSuperBlockJsons.
 *
 * Each top-level array element represents one superblock (certification section).
 * Each inner element represents one block (course) within that superblock.
 * Block objects include the superblock dashedName and readable title (looked up via
 * getAllSuperblockTitlesAndDashedNames with a fallback for legacy names not in the
 * filtered list), making each block self-describing without external index lookups.
 *
 * @param {Array} superblock - Array of superblock data objects from getSuperBlockJsons
 * @returns {Promise<Array>} 2D array of block objects
 *
 * Example output:
 * [
 *   [
 *     {
 *       superblock: 'back-end-development-and-apis',
 *       superblockReadableTitle: 'Back End Development and APIs',
 *       blockName: 'Managing Packages with NPM',
 *       selector: 'managing-packages-with-npm',
 *       dashedName: 'managing-packages-with-npm',
 *       allChallenges: ['challengeId1', 'challengeId2', ...],
 *       order: 0
 *     },
 *     ...
 *   ],
 *   [ ... ] // next superblock's blocks
 * ]
 */
export async function createSuperblockDashboardObject(superblock) {
  let superblockDashedNamesAndTitlesArray =
    await getAllSuperblockTitlesAndDashedNames();

  let sortedBlocks = superblock.map(currBlock => {
    let certification = Object.keys(currBlock).map(certificationName => {
      let superblockDashedNameAndTitle =
        superblockDashedNamesAndTitlesArray.find(
          superblockDashedNameAndTitleJSON =>
            superblockDashedNameAndTitleJSON['superblockDashedName'] ===
            certificationName
        ) ?? {
          superblockDashedName: certificationName,
          superblockReadableTitle: certificationName
        };

      let blockInfo = Object.entries(
        currBlock[certificationName]['blocks']
      ).map(([course]) => {
        /*
The following object is necessary in order to sort our courses/superblocks correctly in order to pass them into our dashtabs.js component

Layout:
blockInfo: This is an array of objects that will be passed into our sorting function.

name: This is the human readable name of the course
selector: this is for our dashtabs component to have a unique selector for each dynamically generated tab
allChallenges: As the name implies, this holds all of our challenges (inside of the current block) in correct order
The last bit is the order of the current block inside of the certification, not the challenges that exist inside of this block
*/
        let currCourseBlock = {
          superblock: superblockDashedNameAndTitle.superblockDashedName,
          superblockReadableTitle:
            superblockDashedNameAndTitle.superblockReadableTitle,
          blockName:
            currBlock[certificationName]['blocks'][course]['challenges'][
              'name'
            ],
          /*
This selector is changed inside of components/dashtabs.js
If you are having issues with the selector, you should probably check there.
*/
          selector: course,
          dashedName: course,
          allChallenges:
            currBlock[certificationName]['blocks'][course]['challenges'][
              'challengeOrder'
            ],
          order:
            currBlock[certificationName]['blocks'][course]['challenges'][
              'order'
            ]
        };
        return currCourseBlock;
      });
      sortSuperBlocks(blockInfo);
      return blockInfo;
    });
    return certification;
  });
  // Since we return new arrays at every map, we have to flatten our 3D array down to 2D.
  return sortedBlocks.flat(1);
}
