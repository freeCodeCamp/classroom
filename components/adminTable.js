import Link from 'next/link';
import React from 'react';
import { useTable } from 'react-table';
import { Table } from '@freecodecamp/ui';
import TablePagination from './TablePagination';

export default function AdminTable(props) {
  const [entriesPerPage, setEntriesPerPage] = React.useState(10);
  const [pageIndex, setPageIndex] = React.useState(0);

  const columns = React.useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'col1', // accessor is the "key" in the data
        width: '20%'
      },
      {
        Header: 'Email',
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

  const paginatedRows = React.useMemo(
    () =>
      rows.slice(pageIndex * entriesPerPage, (pageIndex + 1) * entriesPerPage),
    [rows, pageIndex, entriesPerPage]
  );

  return (
    <>
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
          {paginatedRows.map((row, index) => {
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
        <tfoot>
          <tr>
            <td colSpan='4'>
              <TablePagination
                id='admin-users'
                pageIndex={pageIndex}
                entriesPerPage={entriesPerPage}
                totalEntries={rows.length}
                onPageChange={setPageIndex}
                onEntriesPerPageChange={size => {
                  setEntriesPerPage(size);
                  setPageIndex(0);
                }}
              />
            </td>
          </tr>
        </tfoot>
      </Table>
    </>
  );
}
