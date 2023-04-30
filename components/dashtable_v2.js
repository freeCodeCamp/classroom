import { useTable } from 'react-table';
import React from 'react';

export default function App() {
  const s_data = [
    {
      name: 'abc',
      activity: '111',
      progress: '10%',
      detail: 'detail'
    },
    {
      name: 'aaaaaaa',
      activity: '222',
      progress: '20%',
      detail: 'detail'
    },
    {
      name: 'bbb',
      activity: '333',
      progress: '30%',
      detail: 'detail'
    },
    {
      name: 'ccc',
      activity: '444',
      progress: '40%',
      detail: 'detail'
    }
  ];

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

  const data = React.useMemo(() => mapData(s_data), []);

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
