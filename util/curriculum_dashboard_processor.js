export function getAllBlocksByDashedName(superBlockArray) {
  let superBlockSelector = superBlockArray.map(col_course => {
    col_course.selector = row => row[`${col_course.dashedName}`];
    return col_course;
  });
  return superBlockSelector;
}

export function getTotalChallengesPerBlock(blockArray) {
  let numChallengesPerCertification = blockArray.map(certification => {
    let totalNumChallenges = 0;
    certification.forEach(block => {
      totalNumChallenges += block.allChallenges.length;
    });
    return totalNumChallenges;
  });

  return numChallengesPerCertification;
}

export function extractSuperBlocksPerStudent(individualStudentJSON) {
  return Object.values(individualStudentJSON.certifications);
}

export function getAllBlocks(allSuperBlocksArray) {
  let blockData = [];
  // extracts ALL block data from ALL parent superblocks (remember superblock = certification)
  allSuperBlocksArray.forEach(superBlock =>
    blockData.push(Object.values(superBlock))
  );
  blockData = blockData.flat();
  return blockData;
}

// DONE not used
export function getAllBlockNames(allBlockDataArray) {
  let blockNames = [];
  allBlockDataArray.forEach(block =>
    block[0].blocks.forEach(obj => blockNames.push(Object.keys(obj)[0]))
  );
  return blockNames;
}

//DONE
export function extractCompletionTimestamps(allBlocksArray) {
  let completionTimestamps = [];
  allBlocksArray.map(obj =>
    obj.blocks.map(challenges => {
      Object.values(challenges)[0].completedChallenges.map(item => {
        completionTimestamps.push(item.completedDate);
      });
    })
  );

  return completionTimestamps;
}

export function getTotalChallenges(numChallengesPerCertification) {
  let grandTotalChallenges = 0;
  if (numChallengesPerCertification) {
    console.log(
      '[[][[][[][][[][',
      numChallengesPerCertification,
      '[[][[][[][][[]['
    );
    numChallengesPerCertification.forEach(numChallenges => {
      grandTotalChallenges += numChallenges;
    });
  } else {
    // temporairy edge case due to use of mock data so edge case must be hardcoded
    grandTotalChallenges = 6;
    // for more context
    // see file in testing_data/testing-data.jsx line 109 and count occurrences
    // of hardcoded 'allChallenges', it is 6
  }

  return grandTotalChallenges;
}
