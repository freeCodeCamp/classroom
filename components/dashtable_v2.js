import { useTable } from 'react-table';
import { Table } from '@freecodecamp/ui';
import React from 'react';
import getStudentActivity from './studentActivity';
import ProgressBar from './ProgressBar';
import Link from './helpers/link';
import { extractStudentCompletionTimestamps } from '../util/student/extractTimestamps';

export default function GlobalDashboardTable(props) {
  let grandTotalChallenges = props.totalChallenges;

  let rawStudentSummary = props.studentData.map(studentJSON => {
    let email = studentJSON.email;
    let completionTimestamps = [];

    completionTimestamps = extractStudentCompletionTimestamps(
      studentJSON.certifications
    );

    let rawStudentActivity = {
      recentCompletions: completionTimestamps
    };

    let studentActivity = getStudentActivity(rawStudentActivity);
    let numCompletions = completionTimestamps.length;

    let percentageCompletion = (
      <ProgressBar
        value={numCompletions}
        max={grandTotalChallenges}
        label={`Progress for ${email}`}
      />
    );

    let studentSummary = {
      email: email,
      activity: studentActivity,
      progress: percentageCompletion,
      detail: (
        <Link to={`/dashboard/v2/details/${props.classroomId}/${email}`}>
          details
        </Link>
      )
    };

    return studentSummary;
  });

  const mapData = function (original_data) {
    let table_data = original_data.map(student => {
      let mapped_student = {
        col1: student.email,
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
        Header: 'Student Email',
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
      <div className='overflow-x-auto'>
        <Table {...getTableProps()} striped>
          <thead>
            {headerGroups.map((headerGroup, index) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={index}>
                {headerGroup.headers.map((column, index) => (
                  <th {...column.getHeaderProps()} key={index}>
                    {column.render('Header')}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row, index) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} key={index}>
                  {row.cells.map((cell, index) => {
                    return (
                      <td
                        {...cell.getCellProps()}
                        style={{ width: cell.column.width }}
                        key={index}
                      >
                        {cell.render('Cell')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </>
  );
}
