export default function getStudentActivity(props) {
  let studentActivity;
  var mostRecentDate = new Date(props.mostRecentCompletionTime);
  let mostRecentDateText =
    'Last completion time: ' + mostRecentDate.toLocaleString();
  if (props.recentCompletions >= 2) {
    // if the student completed at least 2 challenges within the past one week
    studentActivity = (
      <body>
        <div
          style={{ background: 'green', width: '20px', height: '20px' }}
          title={mostRecentDateText}
        ></div>
      </body>
    );
  } else if (props.recentCompletions == 0) {
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
