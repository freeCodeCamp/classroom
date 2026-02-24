/**
 * Calculates total challenges across all superblocks
 * @param {Array} superblockDasboardObj - 2D array of superblock objects
 * @returns {number} Total number of challenges
 */
export function getTotalChallengesForSuperblocks(superblockDasboardObj) {
  let totalChallengesInSuperblock = 0;
  superblockDasboardObj.forEach(blockObjArray => {
    blockObjArray.forEach(blockObj => {
      totalChallengesInSuperblock += blockObj.allChallenges.length;
    });
  });

  return totalChallengesInSuperblock;
}

/**
 * Gets student progress in a specific superblock
 * @param {Object} studentSuperblocksJSON - Student progress data
 * @param {string} specificSuperblockDashedName - Superblock dashedName
 * @returns {Array} Array of block progress details
 */
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

/**
 * Gets total challenges completed in a specific block
 * @param {Array} studentProgressInBlock - Student progress data for blocks
 * @param {string} blockName - Name of the block
 * @returns {number} Number of completed challenges in block
 */
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
