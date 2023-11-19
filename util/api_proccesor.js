export const FCC_BASE_URL = 'https://www.freecodecamp.org/curriculum-data/v1/';
export const AVAILABLE_SUPER_BLOCKS =
  FCC_BASE_URL + 'available-superblocks.json';

/** ============ getAllTitlesAndDashedNamesSuperblockJSONArray() ============ */
export async function getAllTitlesAndDashedNamesSuperblockJSONArray() {
  // calls this API https://www.freecodecamp.org/curriculum-data/v1/available-superblocks.json
  const superblocksres = await fetch(AVAILABLE_SUPER_BLOCKS);

  // the response of this structure is [ superblocks: [ {}, {}, ...etc] ]
  const curriculumData = await superblocksres.json();

  // which is why we return curriculumData.superblocks
  return curriculumData.superblocks;
}

/** ============ getAllSuperblockTitlesAndDashedNames() ============ */
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

/** ============ getSuperblockTitlesInClassroomByIndex(fccCertificationsArrayOfIndicies) ============ */
// The reason we use an array of indicies is because that is how the data is stored in the Classroom table after class creation, see ClassInviteTable.js and modal.js component for more context.
export async function getSuperblockTitlesInClassroomByIndex(
  fccCertificationsArrayOfIndicies
) {
  let allSuperblockTitles = await getAllSuperblockTitlesAndDashedNames();

  return fccCertificationsArrayOfIndicies.map(
    x => allSuperblockTitles[x].superblockReadableTitle
  );
}

/** ============ checkIfStudentHasProgressDataForSuperblock(studentJSON, superblockDashboardObj) ============ */
// Since we are using hard-coded mock data at the moment, this check allows to anticipate the
// correct response, however, when the student API data goes live, it will be assumed that it will on
// provide student data on the specified superblocks selected by the teacher
export function checkIfStudentHasProgressDataForSuperblocksSelectedByTeacher(
  studentJSON,
  superblockDashboardObj
) {
  // Returns a boolean matrix which checks to see enrollment in at least 1 superblock (at least 1 because in the GlobalDashboard component we calculate the cumulative progress)

  let superblockTitlesSelectedByTeacher = [];

  superblockDashboardObj.forEach(superblockObj => {
    superblockTitlesSelectedByTeacher.push(superblockObj[0].superblock);
  });

  let studentResponseDataHasSuperblockBooleanArray = [];
  studentJSON.forEach(studentDetails => {
    let individualStudentEnrollmentStatus = [];
    studentDetails.certifications.forEach(certObj => {
      let studentIsEnrolledSuperblock = false;
      if (superblockTitlesSelectedByTeacher.includes(Object.keys(certObj)[0])) {
        studentIsEnrolledSuperblock = true;
      }
      individualStudentEnrollmentStatus.push(studentIsEnrolledSuperblock);
    });
    studentResponseDataHasSuperblockBooleanArray.push(
      individualStudentEnrollmentStatus
    );
  });

  return studentResponseDataHasSuperblockBooleanArray;
}

/** ============ sortSuperBlocks(superblock) ============ */
/**
 * This function returns a 2D array for each block within blocks
 * block[0] is the name of the course
 * block[1] is a dictionary {desc, challenges}
 * Example Usage:
 * sortSuperBlocks("2022/responsive-web-design.json", "https://www.freecodecamp.org/curriculum-data/v1/2022/responsive-web-design.json")
 *
 */
export function sortSuperBlocks(superblock) {
  let sortedBlock = superblock.sort((a, b) => a['order'] - b['order']);
  return sortedBlock;
}

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
export async function getDashedNamesURLs(fccCertifications) {
  const superblocksres = await fetch(AVAILABLE_SUPER_BLOCKS);

  const curriculumData = await superblocksres.json();

  return fccCertifications.map(
    x => FCC_BASE_URL + curriculumData['superblocks'][x]['dashedName'] + '.json'
  );
}

/** ============ getNonDashedNamesURLs([0,1,2) ============ */
/**
 * The parameter relates to the index found at the following API response
 * https://www.freecodecamp.org/curriculum-data/v1/available-superblocks.json
 *
 * Context: The way we know which superblocks are assigned in the classroom
 * is by storing the indicies in our DB (Prisma to access/write)
 * [see the Classroom table, then the fccCertifications column]
 * if you would like more context see the following file(s):
 * pages/classes/index.js and take a look at the Modal component
 * (components/modal.js), and also take a look at the
 * ClassInviteTable component (component/ClassInviteTable).
 * You can also search the codebase for the folling string to get more context
 * on the relation on the indicies stored in Prisma (unded the
 * fccCertifications column): "Select certifications:"
 */
export async function getNonDashedNamesURLs(fccCertificationsIndex) {
  const superblocksres = await fetch(AVAILABLE_SUPER_BLOCKS);

  const curriculumData = await superblocksres.json();

  return fccCertificationsIndex.map(
    x => curriculumData['superblocks'][x]['title']
  );
}

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
 * {
 * '2022/responsive-web-design': { intro: [Array], blocks: [Object] }
 * },
 * {
 * 'javascript-algorithms-and-data-structures': { intro: [Array], blocks: [Object] }
 * }
 * ]
 *
 * */
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

/** ============ createSuperblockDashboardObject(superblock) ============ */
/*
 * [Parameters] an array of objects containing superblock/certificate information as a parameter.
 *
 * [Returns] a 2d array of objects, where the array length is 1, and array[0] is length N, where array[0][N] are objects
 * with block (not superblock) data.
 *
 * Example usage:
 * createDasboardObject([
 * {
 * '2022/responsive-web-design': { intro: [Array], blocks: [Object] }
 * },
 * {
 * 'javascript-algorithms-and-data-structures': { intro: [Array], blocks: [Object] }
 * }
 *])
 *
 *
 *
 * Example output:
 * [
 * [
 * {
 * name: 'Learn HTML by Building a Cat Photo App',
 * selector: 'learn-html-by-building-a-cat-photo-app',
 * dashedName: 'learn-html-by-building-a-cat-photo-app',
 * allChallenges: [Array],
 * order: 0
 * },
 * {
 * name: 'Learn Basic CSS by Building a Cafe Menu',
 * selector: 'learn-basic-css-by-building-a-cafe-menu',
 * dashedName: 'learn-basic-css-by-building-a-cafe-menu',
 * allChallenges: [Array],
 * order: 1
 * }
 * ]
 * ]
 *
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

/** ============ fetchStudentData() ============ */
export async function fetchStudentData() {
  let data = await fetch(process.env.MOCK_USER_DATA_URL);
  return data.json();
}

/** ============ getIndividualStudentData(studentEmail) ============ */
// Uses for the details page
export async function getIndividualStudentData(studentEmail) {
  let studentData = await fetchStudentData();
  let individualStudentObj = {};
  studentData.forEach(individualStudentDetailsObj => {
    if (individualStudentDetailsObj.email === studentEmail) {
      individualStudentObj = individualStudentDetailsObj;
    }
  });

  return individualStudentObj;
}

/** ============ getTotalChallengesForSuperblocks(superblockDasboardObj) ============ */
export function getTotalChallengesForSuperblocks(superblockDasboardObj) {
  let totalChallengesInSuperblock = 0;
  superblockDasboardObj.forEach(blockObjArray => {
    blockObjArray.forEach(blockObj => {
      totalChallengesInSuperblock += blockObj.allChallenges.length;
    });
  });

  return totalChallengesInSuperblock;
}

/** ============ extractStudentCompletionTimestamps(studentSuperblockProgressJSONArray) ============ */
export function extractStudentCompletionTimestamps(
  studentSuperblockProgressJSONArray
) {
  let completedTimestampsArray = [];

  studentSuperblockProgressJSONArray.forEach(superblockProgressJSON => {
    // since the keys are dynamic we have to use Object.values(obj)
    let superblockProgressJSONArray = Object.values(superblockProgressJSON)[0]
      .blocks;
    superblockProgressJSONArray.forEach(blockProgressJSON => {
      let blockKey = Object.keys(blockProgressJSON)[0];
      let allCompletedChallengesArrayWithTimestamps =
        blockProgressJSON[blockKey].completedChallenges;
      allCompletedChallengesArrayWithTimestamps.forEach(completionDetails => {
        completedTimestampsArray.push(completionDetails.completedDate);
      });
    });
  });
  return completedTimestampsArray;
}

/** ============ getStudentProgressInSuperblock(studentSuperblocksJSON, specificSuperblockDashedName) ============ */
export function getStudentProgressInSuperblock(
  studentSuperblocksJSON,
  specificSuperblockDashedName
) {
  let blockProgressDetails = [];

  studentSuperblocksJSON.certifications.forEach(superblockProgressJSON => {
    // the keys are dynamic which is why we have to use Object.keys(obj)
    let superblockDashedName = Object.keys(superblockProgressJSON)[0];
    if (specificSuperblockDashedName === superblockDashedName) {
      blockProgressDetails = Object.values(superblockProgressJSON)[0].blocks;
    }
  });

  return blockProgressDetails;
}

/** ============ getStudentTotalChallengesCompletedInBlock(studentProgressInBlock,blockName) ============ */
export function getStudentTotalChallengesCompletedInBlock(
  studentProgressInBlock,
  blockName
) {
  let totalChallengesCompletedInBlock = 0;
  studentProgressInBlock.forEach(blockProgressObj => {
    let blockTitle = Object.keys(blockProgressObj)[0];

    if (blockTitle === blockName) {
      totalChallengesCompletedInBlock =
        blockProgressObj[blockTitle].completedChallenges.length;
    }
  });

  return totalChallengesCompletedInBlock;
}
