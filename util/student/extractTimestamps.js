/**
 * Extracts all completion timestamps from student progress data
 * @param {Array} studentSuperblockProgressJSONArray - Array of superblock progress objects
 * @returns {Array<number>} Array of completion timestamps
 */
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

/**
 * Extracts completion timestamps filtered by selected superblocks
 * @param {Array} studentSuperblockProgressJSONArray - Array of superblock progress objects
 * @param {Array<string>} selectedSuperblocks - Array of superblock dashedNames to filter by
 * @returns {Array<number>} Array of completion timestamps for selected superblocks
 */
export function extractFilteredCompletionTimestamps(
  studentSuperblockProgressJSONArray,
  selectedSuperblocks
) {
  let completedTimestampsArray = [];

  studentSuperblockProgressJSONArray.forEach(superblockProgressJSON => {
    let superblockDashedName = Object.keys(superblockProgressJSON)[0];

    // Only include selected superblocks
    if (!selectedSuperblocks.includes(superblockDashedName)) {
      return;
    }

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
