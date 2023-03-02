export default function getStudentActivity(props) {
  let studentActivity;

  if (props >= 2) {
    // if the student completed at least 2 challenges within the past one week
    studentActivity = (
      <div style={{ background: 'green', width: '20px', height: '20px' }}></div>
    );
  } else if (props == 0) {
    // if the student completed 0 challenges within the past one week
    studentActivity = (
      <div style={{ background: 'red', width: '20px', height: '20px' }}></div>
    );
  } else {
    // if the student completed 1 challenge within the past one week
    studentActivity = (
      <div
        style={{ background: 'yellow', width: '20px', height: '20px' }}
      ></div>
    );
  }
  return studentActivity;
}
