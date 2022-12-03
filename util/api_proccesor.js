export const FCC_BASE_URL = 'https://www.freecodecamp.org/curriculum-data/v1/';
export const AVAILABLE_SUPER_BLOCKS =
  FCC_BASE_URL + 'available-superblocks.json';

/* This function returns a 2D array for each block within blocks
block[0] is the name of the course
block[1] is a dictionary {desc, challenges}
Example Usage: sortSuperBlocks("2022/responsive-web-design.json", "https://www.freecodecamp.org/curriculum-data/v1/2022/responsive-web-design.json")
*/

export function sortSuperBlocks(superblock) {
  let sortedBlock = superblock.sort((a, b) => a[1] - b[1]);
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
      ).map(([currBlockInfo]) => {
        /*
            The following object is necessary in order to sort our courses/superblocks correctly in order to pass them into our dashtabs.js component

            Layout:
            blockInfo: This is an array of objects that will be passed into our sorting function.

            name: This is the human readable name of the course
            selector: this is for our dashtabs component to have a unique selector for each dynamically generated tab
            allChallenges: As the name implies, this holds all of our challenges (inside of the current block) in correct order
            
            The last bit is the order of the current block inside of the certification, not the challenges that exist inside of this block
          */
        let currCourseBlock = [
          {
            name: currBlock[certificationName]['blocks'][currBlockInfo][
              'challenges'
            ]['name'],
            selector: currBlockInfo,
            allChallenges: currBlock[certificationName]['blocks'][
              currBlockInfo
            ]['challenges']['challengeOrder'].map(x => x[0])
          },
          currBlock[certificationName]['blocks'][currBlockInfo]['challenges'][
            'order'
          ]
        ];
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
  let data = await fetch('http://localhost:3001/data');
  return data.json();
}
