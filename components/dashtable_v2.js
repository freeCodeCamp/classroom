import { useTable } from 'react-table';
import React from 'react';
import getStudentActivity from './studentActivity';
import { extractStudentCompletionTimestamps } from '../util/api_proccesor';

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
      email: email,
      activity: studentActivity,
      progress: percentageCompletion,
      detail: (
        <a
          // TODO:
          href={`/dashboard/v2/details/${props.classroomId}/` + `${email}`}
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
      <table
        {...getTableProps()}
        style={{ border: 'solid 1px #0a0a23', width: '100%', margin: 'auto' }}
      >
        <thead>
          {headerGroups.map((headerGroup, index) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={index}>
              {headerGroup.headers.map((column, index) => (
                <th
                  {...column.getHeaderProps()}
                  style={{
                    borderBottom: 'solid 3px grey',
                    color: 'black',
                    fontWeight: 'bold'
                  }}
                  key={index}
                >
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
                      style={{
                        padding: '10px',
                        border: 'solid 1px grey',
                        textAlign: 'center',
                        width: cell.column.width
                      }}
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
      </table>
    </>
  );
}
