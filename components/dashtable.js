import DataTable from 'react-data-table-component';

//from MDN docs
function intersection(setA, setB) {
  let _intersection = new Set();
  for (let elem of setB) {
    if (setA.has(elem.id)) {
      _intersection.add(elem);
    }
  }
  return _intersection;
}

export default function DashTable(props) {
  let studentData = Object.entries(props.data).map(([i]) => {
    let studentName = Object.keys(props.data[i])[0];
    let studentCompletionData = {};
    studentCompletionData['id'] = Number(i) + 1;
    let certificationCompletionData = props.columns.map(course => {
      let courseSelector = course.selector;
      // If the course selector is not the student's name, calculate their scores.
      if (courseSelector != 'student-name') {
        /* 
        The try/catch below checks to see if the current student has completed any part of the current course.
        This is important because if they have not, we hit an undefined error, causing the dashboard to crash.
        Instead, we will just skip it and make the score 0/course.allChallenges.length
        */
        try {
          let studentCourseCompleted =
            props.data[i][studentName]['blocks'][courseSelector][
              'completedChallenges'
            ];
          let courseCompletion = intersection(
            new Set(course.allChallenges),
            new Set(studentCourseCompleted)
          ).size;
          studentCompletionData[
            courseSelector
          ] = `${courseCompletion}/${course.allChallenges.length}`;
        } catch (e) {
          studentCompletionData[courseSelector] = `${0}/${
            course.allChallenges.length
          }`;
        }
      } else {
        studentCompletionData[courseSelector] = studentName;
      }
      // This ensures we only return when everything is completely filled up.
      if (Object.keys(studentCompletionData).length == props.columns.length) {
        return studentCompletionData;
      }
    });
    // This ensures that only objects are being sent to our dashboard
    certificationCompletionData = certificationCompletionData.filter(
      obj => typeof obj == 'object'
    );
    return certificationCompletionData;
  });
  // Filters out any possible undefined objs
  studentData = studentData.filter(obj => typeof obj == 'object');
  // Due to us using .map, we are returning 2D Arrays for student data, our <DataTable /> needs our data to be a 1D Array, so we will be flattening it to accommodate
  studentData = studentData.flat(1);
  return <DataTable columns={props.columns} data={studentData} pagination />;
}
// const dummy_cols = [
//   {
//       name: 'Title',
//       selector: row => row.title,
//   },
//   {
//       name: 'Year',
//       selector: row => row.year,
//   },
// ];
// console.log(props.columns)

// const dummy_data = [
//   {
//       id: 1,
//       'student-name': 'Testing1',
//       year: '1988',
//   },
//   {
//       id: 2,
//       title: 'Ghostbusters',
//       year: '1984',
//   },
// ]
