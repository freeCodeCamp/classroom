import Link from 'next/link';
import React from 'react';
import { useTable } from 'react-table';

export default function AdminTable(props) {
  const columns = React.useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'col1', // accessor is the "key" in the data
        width: '20%'
      },
      {
        Header: 'UserEmail',
        accessor: 'col2',
        width: '20%'
      },
      {
        Header: 'Role',
        accessor: 'col3',
        width: '20%'
      },
      {
        Header: 'Actions',
        accessor: 'col4',
        width: '20%'
      }
    ],
    []
  );

  const data = props.data.map(user => {
    let mapped_user = {
      col1: user.name,
      col2: user.email,
      col3: user.role,
      col4: (
        <Link href={`/admin/actions/${user.id}`}>View Possible Actions</Link>
      )
    };
    return mapped_user;
  });

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });

  return (
    <>
      <table
        {...getTableProps()}
        style={{
          border: 'solid 1px #0a0a23',
          width: '100%',
          margin: 'auto',
          fontFamily: 'monospace'
        }}
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
                        border: 'solid 1px 0px grey',
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
