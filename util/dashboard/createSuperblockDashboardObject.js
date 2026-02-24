import { getAllSuperblockTitlesAndDashedNames } from '../curriculum/getAllSuperblockTitlesAndDashedNames';
import { sortSuperBlocks } from './sortSuperBlocks';

/**
 * Creates a dashboard object from superblock data
 * @param {Array} superblock - Array of superblock objects
 * @returns {Promise<Array>} 2D array of block objects with formatted data
 *
 * NOTE: This function is deprecated for v9 curriculum which doesn't have individual REST API JSON files.
 * For v9, use the challenge map directly instead.
 *
 * Example output:
 * [
 *   [
 *     {
 *       name: 'Learn HTML by Building a Cat Photo App',
 *       selector: 'learn-html-by-building-a-cat-photo-app',
 *       dashedName: 'learn-html-by-building-a-cat-photo-app',
 *       allChallenges: [Array],
 *       order: 0
 *     },
 *     ...
 *   ]
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
        );

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
