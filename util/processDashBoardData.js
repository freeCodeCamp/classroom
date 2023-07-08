// util/processDashboardData.js
import getStudentActivity from '../components/studentActivity';
import React from 'react';

export function processDashboardData(props) {
  let allCertifications = props.certifications.map(col_course => {
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

  let rawStudentSummary = Object.entries(props.studentData).map(([i]) => {
    let studentName = Object.keys(props.studentData[i])[0];
    let completionTimestamps = [];
    let blocks;
    try {
      blocks = Object.keys(props.studentData[i][studentName]['blocks']);
    } catch (e) {
      blocks = [];
    }

    for (let j = 0; j < blocks.length; j++) {
      let studentCompletions =
        props.studentData[i][studentName]['blocks'][blocks[j]][
          'completedChallenges'
        ];

      studentCompletions.forEach(({ completedDate }) => {
        completionTimestamps.push(completedDate);
      });
    }

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
    let studentSummary = {
      name: studentName,
      activity: studentActivity,
      progress: percentageCompletion,
      detail: (
        <a
          href={
            `/dashboard/v2/details/${props.classroomId}/` + `${studentName}`
          }
        >
          {' '}
          details{' '}
        </a>
      )
    };
    return studentSummary;
  });

  const mapData = function (original_data) {
    let table_data = original_data.map(student => {
      let mapped_student = {
        col1: student.name,
        col2: student.activity,
        col3: student.progress,
        col4: student.detail
      };
      return mapped_student;
    });
    return table_data;
  };

  const data = mapData(rawStudentSummary);

  const columns = [
    {
      Header: 'Student Name',
      accessor: 'col1', // accessor is the "key" in the data
      width: '20%'
    },
    {
      Header: 'Activity',
      accessor: 'col2',
      width: '10%'
    },
    {
      Header: 'Progress',
      accessor: 'col3',
      width: '20%'
    },
    {
      Header: 'Details',
      accessor: 'col4',
      width: '50%'
    }
  ];

  return { data, columns };
}
