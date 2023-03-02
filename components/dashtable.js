import DataTable from 'react-data-table-component';
import getStudentActivity from './studentActivity';

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
  /*
    This part of our code handles some things with our columns.
    
    
    Here we are altering the selectors inside of our courses. 
    We are doing it here rather than in our API processor since we cannot return a function in JSON.
  */
  let columns = props.columns.map(col_course => {
    col_course.selector = row => row[`${col_course.dashedName}`];
    return col_course;
  });

  /* 
    This section formats our student data and course data to be able to build our table

    Student data is an array that holds objects that hold completion data for the certifications in our classroom.
  */

  let studentData = Object.entries(props.data).map(([i]) => {
    let studentName = Object.keys(props.data[i])[0];

    const thresholdTime = 604800000; // time of one week in milliseconds
    let today = Math.floor(new Date().getTime());
    let recentCompletions = 0;
    let mostRecentCompletionTime = 0;
    try {
      let blocks = Object.keys(props.data[i][studentName]['blocks']);

      for (let j = 0; j < blocks.length; j++) {
        let studentCompletions =
          props.data[i][studentName]['blocks'][blocks[j]][
            'completedChallenges'
          ];
        studentCompletions.forEach(({ completedDate }) => {
          let period = today - completedDate;
          if (period < thresholdTime) {
            recentCompletions++;
          }
          if (mostRecentCompletionTime < completedDate) {
            mostRecentCompletionTime = completedDate;
          }
        });
      }
    } catch (e) {
      recentCompletions = 0;
    }

    let studentCompletionData = {};
    studentCompletionData['id'] = Number(i) + 1;
    let certificationCompletionData = columns.map(course => {
      let courseSelector = course.dashedName;
      // If the course selector is not the student's name, calculate their scores.
      if (
        courseSelector != 'student-name' &&
        courseSelector != 'student-activity'
      ) {
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
      } else if (courseSelector == 'student-name') {
        studentCompletionData[courseSelector] = studentName;
      } else if (courseSelector == 'student-activity') {
        let studentActivityData = {
          recentCompletions,
          mostRecentCompletionTime
        };
        studentCompletionData[courseSelector] =
          getStudentActivity(studentActivityData);
      }

      // This ensures we only return when everything is completely filled up.
      if (Object.keys(studentCompletionData).length == columns.length) {
        return studentCompletionData;
      }
    });
    // This ensures that only objects are being sent to our dashboard
    certificationCompletionData = certificationCompletionData.filter(
      obj => typeof obj == 'object'
    );
    return certificationCompletionData;
  });
  // Due to us using .map, we are returning 2D Arrays for student data, our <DataTable /> needs our data to be a 1D Array, so we will be flattening it to accommodate
  studentData = studentData.flat(1);
  return <DataTable columns={columns} data={studentData} pagination />;
}
