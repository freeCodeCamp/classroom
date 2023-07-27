import React from 'react';
import { useTable } from 'react-table';
import getStudentActivityAndProgress from '../../util/processDashboardData';
export default function GlobalDashboardTable({
  classroomId,
  studentData,
  certifications
}) {
  let formattedData = React.useMemo(() => [], []);
  // formattedData = [];
  studentData.forEach(data => {
    // The 0th index is the all the certifications that the student is enrolled in
    // The 1st index is all available certifications by FCC
    let studentCertsAndAllCerts = [data.certifications, certifications];
    let activityAndProgressResults = getStudentActivityAndProgress(
      studentCertsAndAllCerts
    );
    let summary = {
      name: data.email,
      activity: activityAndProgressResults[0],
      progress: activityAndProgressResults[1],
      detail: (
        <a
          // TODO:
          href={`/dashboard/v2/details/${classroomId}/` + `${data.name}`}
        >
          {' '}
          details{' '}
        </a>
      )
    };
    formattedData.push(summary);
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

  const data = React.useMemo(() => mapData(formattedData), [formattedData]);
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
