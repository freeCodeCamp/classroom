/**
 * Extracts all completion timestamps from student progress data
 * @param {Array} studentSuperblockProgressJSONArray - Array of superblock progress objects
 * @returns {Array<number>} Array of completion timestamps
 */
export function extractStudentCompletionTimestamps(
  studentSuperblockProgressJSONArray
) {
  let completedTimestampsArray = [];

  if (!Array.isArray(studentSuperblockProgressJSONArray)) {
    return completedTimestampsArray;
  }

  studentSuperblockProgressJSONArray.forEach(superblockProgressJSON => {
    if (!superblockProgressJSON) return;
    // since the keys are dynamic we have to use Object.values(obj)
    const val = Object.values(superblockProgressJSON)[0];
    if (val && Array.isArray(val.blocks)) {
      val.blocks.forEach(blockProgressJSON => {
        if (!blockProgressJSON) return;
        let blockKey = Object.keys(blockProgressJSON)[0];
        let blockData = blockProgressJSON[blockKey];
        if (blockData && Array.isArray(blockData.completedChallenges)) {
          blockData.completedChallenges.forEach(completionDetails => {
            if (completionDetails && completionDetails.completedDate) {
              completedTimestampsArray.push(completionDetails.completedDate);
            }
          });
        }
      });
    }
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
  selectedSuperblocks = []
) {
  let completedTimestampsArray = [];

  if (!Array.isArray(studentSuperblockProgressJSONArray)) {
    return completedTimestampsArray;
  }

  studentSuperblockProgressJSONArray.forEach(superblockProgressJSON => {
    if (!superblockProgressJSON) return;
    let superblockDashedName = Object.keys(superblockProgressJSON)[0];

    // Only include selected superblocks
    if (!selectedSuperblocks.includes(superblockDashedName)) {
      return;
    }

    const val = Object.values(superblockProgressJSON)[0];
    if (val && Array.isArray(val.blocks)) {
      val.blocks.forEach(blockProgressJSON => {
        if (!blockProgressJSON) return;
        let blockKey = Object.keys(blockProgressJSON)[0];
        let blockData = blockProgressJSON[blockKey];
        if (blockData && Array.isArray(blockData.completedChallenges)) {
          blockData.completedChallenges.forEach(completionDetails => {
            if (completionDetails && completionDetails.completedDate) {
              completedTimestampsArray.push(completionDetails.completedDate);
            }
          });
        }
      });
    }
  });

  return completedTimestampsArray;
}
