export default function getStudentActivity(props) {
  let studentActivity;

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

  if (recentCompletionCount >= 2) {
    // if the student completed at least 2 challenges within the past one week
    studentActivity = (
      <body>
        <div
          style={{ background: 'green', width: '20px', height: '20px' }}
          title={mostRecentDateText}
        ></div>
      </body>
    );
  } else if (recentCompletionCount == 0) {
    // if the student completed 0 challenges within the past one week
    studentActivity = (
      <body>
        <div
          style={{ background: 'red', width: '20px', height: '20px' }}
          title={mostRecentDateText}
        ></div>
      </body>
    );
  } else {
    // if the student completed 1 challenge within the past one week
    studentActivity = (
      <body>
        <div
          style={{ background: 'yellow', width: '20px', height: '20px' }}
          title={mostRecentDateText}
        ></div>
      </body>
    );
  }
  return studentActivity;
}
