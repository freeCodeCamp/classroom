import { useTable } from 'react-table';
import React from 'react';
import getStudentActivity from './studentActivity';

export default function ReactTable(props) {
  let allChallenges = props.columns.map(col_course => {
    col_course.selector = row => row[`${col_course.dashedName}`];
    return col_course;
  });

  let numChallenges = allChallenges.map(section => {
    let totalNumChallenges = 0;
    section.map(course => {
      try {
        totalNumChallenges += course.allChallenges.length;
      } catch (e) {
        totalNumChallenges += 0;
      }
    });
    return totalNumChallenges;
  });

  let rawStudentSummary = Object.entries(props.studentData).map(([i]) => {
    let studentName = Object.keys(props.studentData[i])[0];
    let completionTimestamps = [];
    try {
      let blocks = Object.keys(props.studentData[i][studentName]['blocks']);
      for (let j = 0; j < blocks.length; j++) {
        let studentCompletions =
          props.studentData[i][studentName]['blocks'][blocks[j]][
            'completedChallenges'
          ];

        studentCompletions.forEach(({ completedDate }) => {
          completionTimestamps.push(completedDate);
        });
      }
    } catch (e) {
      completionTimestamps = 0;
    }
    let rawStudentActivity = {
      recentCompletions: completionTimestamps
    };
    let studentActivity = getStudentActivity(rawStudentActivity);

    let numCompletions = completionTimestamps.length;
    let totalChallenges = numChallenges[0];
    let percentageCompletion = (
      <div>
        <label>
          {numCompletions}/{totalChallenges}{' '}
        </label>
        <meter
          id='progress'
          min='0'
          max={totalChallenges}
          value={numCompletions}
        ></meter>
      </div>
    );
    let studentSummary = {
      name: studentName,
      activity: studentActivity,
      progress: percentageCompletion,
      detail: 'detail'
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

  const data = React.useMemo(() => mapData(rawStudentSummary), []);

  const columns = React.useMemo(
    () => [
      {
        Header: 'Student Name',
        accessor: 'col1' // accessor is the "key" in the data
      },
      {
        Header: 'Activity',
        accessor: 'col2'
      },
      {
        Header: 'Progress',
        accessor: 'col3'
      },
      {
        Header: 'Details',
        accessor: 'col4'
      }
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });
  // useTable needs to take "columns" and "data", these two variables cannot be renamed

  return (
    <table {...getTableProps()} style={{ border: 'solid 1px blue' }}>
      <thead>
        {headerGroups.map((headerGroup, index) => (
          <tr {...headerGroup.getHeaderGroupProps()} key={index}>
            {headerGroup.headers.map((column, index) => (
              <th
                {...column.getHeaderProps()}
                style={{
                  borderBottom: 'solid 3px red',
                  background: 'aliceblue',
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
                      border: 'solid 1px gray',
                      background: 'papayawhip'
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
  );
}
