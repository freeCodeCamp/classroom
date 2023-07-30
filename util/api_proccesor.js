export const FCC_BASE_URL = 'https://www.freecodecamp.org/curriculum-data/v1/';
export const AVAILABLE_SUPER_BLOCKS =
  FCC_BASE_URL + 'available-superblocks.json';

/* This function returns a 2D array for each block within blocks
block[0] is the name of the course
block[1] is a dictionary {desc, challenges}
Example Usage: sortSuperBlocks("2022/responsive-web-design.json", "https://www.freecodecamp.org/curriculum-data/v1/2022/responsive-web-design.json")
*/

export function sortSuperBlocks(superblock) {
  let sortedBlock = superblock.sort((a, b) => a['order'] - b['order']);
  return sortedBlock;
}

export async function getDashedNamesURLs(fccCertifications) {
  const superblocksres = await fetch(AVAILABLE_SUPER_BLOCKS);

  const curriculumData = await superblocksres.json();

  return fccCertifications.map(
    x => FCC_BASE_URL + curriculumData['superblocks'][x]['dashedName'] + '.json'
  );
}

export async function getNonDashedNamesURLs(fccCertifications) {
  const superblocksres = await fetch(AVAILABLE_SUPER_BLOCKS);

  const curriculumData = await superblocksres.json();

  return fccCertifications.map(x => curriculumData['superblocks'][x]['title']);
}

export async function getSuperBlockJsons(superblockURLS) {
  let responses = await Promise.all(
    superblockURLS.map(async currUrl => {
      let currResponse = await fetch(currUrl);
      let superblockJSON = currResponse.json();
      return superblockJSON;
    })
  );
  return responses;
}

export function createDashboardObject(superblock) {
  let sortedBlocks = superblock.map(currBlock => {
    let certification = Object.keys(currBlock).map(certificationName => {
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
          name: currBlock[certificationName]['blocks'][course]['challenges'][
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

export async function fetchStudentData() {
  let data = await fetch(process.env.MOCK_USER_DATA_URL);
  return data.json();
}

// Function descriptions

/** ============ getDashedNamesURLs(fccCertifications) ============ */
/*
 * [Parameters] an array of indices as a parameter.
 * Those indices correspond to an index in an array of objects containing superblock data at a JSON endpoint (https://www.freecodecamp.org/curriculum-data/v1/available-superblocks.json)
 * The array of indices is stored in Prisma as fccCertificates (see const certificationNumbers in [id].js).
 *
 * [Returns] an array of URL endpoints where JSON for superblocks is accessed.
 *
 * Example usage:
 * getDashedNamesURLs([0, 2, 3])
 *
 *
 * Example output:
 * [
 * 'https://www.freecodecamp.org/curriculum-data/v1/2022/responsive-web-design.json',
 * 'https://www.freecodecamp.org/curriculum-data/v1/responsive-web-design.json',
 * 'https://www.freecodecamp.org/curriculum-data/v1/back-end-development-and-apis.json'
 * ]
 *
 * */

/** ============ getSuperBlockJsons(superblockURLS) ============ */
/*
 * [Parameters] an array of URLs as a parameter, where the URLs are the json endpoint URLs that contain information about the superblock/certificate.
 *
 * [Returns] an array of objects containing superblock/certificate information.
 * The objects have 1 key: the superblock/certificate URL (dashed/or undashed URL name) and the value of the objects
 * is the corresponding information associated with the superblock/certificate. The values contain two arrays 'intro' and 'blocks'.
 *
 * Example usage:
 * getSuperBlockJsons([
 * 'https://www.freecodecamp.org/curriculum-data/v1/2022/responsive-web-design.json',
 * 'https://www.freecodecamp.org/curriculum-data/v1/javascript-algorithms-and-data-structures.json'
 * ])
 *
 *
 * Example output:
 * [
 *  {
 *    '2022/responsive-web-design': { intro: [Array], blocks: [Object] }
 *  },
 *  {
 *   'javascript-algorithms-and-data-structures': { intro: [Array], blocks: [Object] }
 *  }
 * ]
 *
 * */

/** ============ createDashboardObject(superblock) ============ */
/*
 * [Parameters] an array of objects containing superblock/certificate information as a parameter.
 *
 * [Returns] a 2d array of objects, where the array length is 1, and array[0] is length N, where array[0][N] are objects
 * with block (not superblock) data.
 *
 * Example usage:
 * createDasboardObject([
 *  {
 *   '2022/responsive-web-design': { intro: [Array], blocks: [Object] }
 *  },
 *  {
 *   'javascript-algorithms-and-data-structures': { intro: [Array], blocks: [Object] }
 *  }
 *])
 *
 *
 *
 * Example output:
 * [
 *  [
 *   {
 *     name: 'Learn HTML by Building a Cat Photo App',
 *     selector: 'learn-html-by-building-a-cat-photo-app',
 *     dashedName: 'learn-html-by-building-a-cat-photo-app',
 *     allChallenges: [Array],
 *     order: 0
 *   },
 *   {
 *     name: 'Learn Basic CSS by Building a Cafe Menu',
 *     selector: 'learn-basic-css-by-building-a-cafe-menu',
 *     dashedName: 'learn-basic-css-by-building-a-cafe-menu',
 *     allChallenges: [Array],
 *     order: 1
 *   }
 *  ]
 * ]
 *
 */
