// util/processDashboardData.js
import React from 'react';

function getStudentActivity(props) {
  const thresholdTime = 604800000; // time of one week in milliseconds
  let today = Math.floor(new Date().getTime());
  let recentCompletionCount = 0;
  let mostRecentCompletionTime = 0;

  for (let i = 0; i < props.recentCompletions.length; i++) {
    let period = today - props.recentCompletions[i];
    if (period < thresholdTime) {
      recentCompletionCount++;
    }
    if (mostRecentCompletionTime < props.recentCompletions[i]) {
      mostRecentCompletionTime = props.recentCompletions[i];
    }
  }
  var mostRecentDate = new Date(mostRecentCompletionTime);
  let mostRecentDateText =
    'Last completion time: ' + mostRecentDate.toLocaleString();

  return (
    <div
      className={`${
        recentCompletionCount >= 2
          ? 'bg-green-600 h-5 w-5'
          : recentCompletionCount === 0
          ? 'bg-red-600 h-5 w-5'
          : 'bg-yellow-300 h-5 w-5'
      }`}
      style={{ margin: 'auto' }}
      title={mostRecentDateText}
    ></div>
  );
}

export default function getStudentActivityAndProgress(props) {
  let allCertifications = props[1].map(col_course => {
    col_course.selector = row => row[`${col_course.dashedName}`];
    return col_course;
  });

  let numChallengesPerCertification = allCertifications.map(certification => {
    let totalNumChallenges = 0;
    certification.forEach(block => {
      totalNumChallenges += block.allChallenges.length;
    });
    return totalNumChallenges;
  });

  let grandTotalChallenges = 0;
  numChallengesPerCertification.forEach(numChallenges => {
    grandTotalChallenges += numChallenges;
  });

  let superBlocks = Object.values(props[0]);
  let blocks = [];
  let blockData = [];
  let completionTimestamps = [];

  superBlocks.forEach(superBlock => blockData.push(Object.values(superBlock)));

  let blockName = '';
  blockData.forEach(b =>
    b[0].blocks.forEach(
      obj => ((blockName = Object.keys(obj)[0]), blocks.push(blockName))
    )
  );
  let getCompleted = blockData.flat();

  getCompleted.map(obj =>
    obj.blocks.map(challenges => {
      Object.values(challenges)[0].completedChallenges.map(item => {
        completionTimestamps.push(item.completedDate);
      });
    })
  );

  let rawStudentActivity = {
    recentCompletions: completionTimestamps
  };

  let studentActivity = getStudentActivity(rawStudentActivity);

  let numCompletions = completionTimestamps.length;

  let percentageCompletion = (
    <div>
      <label>
        {numCompletions}/{grandTotalChallenges}{' '}
      </label>
      <meter
        id='progress'
        min='0'
        max={grandTotalChallenges}
        value={numCompletions}
      ></meter>
    </div>
  );

  return [studentActivity, percentageCompletion];
}
