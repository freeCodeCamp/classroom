import { useTable } from 'react-table';
import React from 'react';
import getStudentActivity from './studentActivity';
import UtilityTable from './UtilityTable';
import {
  getTotalChallenges,
  extractSuperBlocksPerStudent,
  getAllBlocks,
  extractCompletionTimestamps
} from '../util/curriculum_dashboard_processor';

export default function GlobalDashboardTable(props) {
  let numChallengesPerCertification = props.totalChallenges;
  let grandTotalChallenges = getTotalChallenges(numChallengesPerCertification);

  let rawStudentSummary = props.studentData.map(individualStudentJSON => {
    let studentName = individualStudentJSON.email;
    let superBlocks = extractSuperBlocksPerStudent(individualStudentJSON);
    let allBlocksArray = getAllBlocks(superBlocks);
    let completionTimestamps = extractCompletionTimestamps(allBlocksArray);

    // Creat objects for useTable hook
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
          // TODO:
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

  const data = React.useMemo(
    () => mapData(rawStudentSummary),
    [rawStudentSummary]
  );

  const columns = React.useMemo(
    () => [
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
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });

  return (
    <>
      <UtilityTable
        getTableProps={getTableProps()}
        getTableBodyProps={getTableBodyProps()}
        headerGroups={headerGroups}
        prepareRow={prepareRow}
        rows={rows}
        columns={columns}
        data={data}
      ></UtilityTable>
    </>
  );
}
