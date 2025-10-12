import Link from 'next/link';
import React from 'react';
import { useTable } from 'react-table';

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

  const startEntry = pageIndex * entriesPerPage + 1;
  const endEntry = Math.min((pageIndex + 1) * entriesPerPage, rows.length);
  const totalEntries = rows.length;

  // Dynamically generate sensible options for rows per page
  const baseOptions = [10, 20, 50, 100];
  let entriesPerPageOptions = baseOptions.filter(opt => opt < totalEntries);
  if (totalEntries < 100 && !entriesPerPageOptions.includes(totalEntries)) {
    entriesPerPageOptions.push(totalEntries);
  }
  // If totalEntries is less than the smallest option, just show totalEntries
  if (totalEntries < 10) {
    entriesPerPageOptions = [totalEntries];
  }

  const canPreviousPage = pageIndex > 0;
  const canNextPage = endEntry < totalEntries;

  const getPaginationButtonStyle = disabled => ({
    marginLeft: '10px',
    marginRight: '10px',
    color: disabled ? '#d1d1d1' : '#757575',
    fontSize: '1.5em'
  });

  return (
    <>
      <table
        {...getTableProps()}
        style={{
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
                    borderBottom: 'solid 1px #e0e0e0',
                    color: 'black',
                    fontWeight: 'bold',
                    textAlign: 'left',
                    padding: '10px'
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
          {paginatedRows.map((row, index) => {
            prepareRow(row);
            return (
              <tr
                {...row.getRowProps()}
                style={{
                  borderTop: '1px solid #e0e0e0',
                  borderBottom: '1px solid #e0e0e0'
                }}
                key={index}
              >
                {row.cells.map((cell, index) => {
                  return (
                    <td
                      {...cell.getCellProps()}
                      style={{
                        padding: '10px',
                        border: 'solid 1px 0px grey',
                        textAlign: 'left',
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
        <tfoot>
          <tr>
            <td colSpan='4' style={{ textAlign: 'right' }}>
              <div
                style={{
                  marginTop: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  color: '#757575'
                }}
              >
                <label>
                  Rows per page:
                  <select
                    value={entriesPerPage}
                    onChange={e => setEntriesPerPage(Number(e.target.value))}
                  >
                    {entriesPerPageOptions.map(option => (
                      <option value={option} key={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <span
                  style={{
                    marginLeft: '20px',
                    marginRight: '10px',
                    color: '#757575'
                  }}
                >
                  {startEntry}-{endEntry} of {totalEntries}
                </span>
                <button
                  onClick={() => setPageIndex(0)}
                  disabled={!canPreviousPage}
                  style={getPaginationButtonStyle(!canPreviousPage)}
                >
                  |<b>&lt;</b>
                </button>
                <button
                  onClick={() => setPageIndex(pageIndex - 1)}
                  disabled={!canPreviousPage}
                  style={getPaginationButtonStyle(!canPreviousPage)}
                >
                  <b>&lt;</b>
                </button>
                <button
                  onClick={() => setPageIndex(pageIndex + 1)}
                  disabled={!canNextPage}
                  style={getPaginationButtonStyle(!canNextPage)}
                >
                  <b>&gt;</b>
                </button>
                <button
                  onClick={() =>
                    setPageIndex(Math.ceil(totalEntries / entriesPerPage) - 1)
                  }
                  disabled={!canNextPage}
                  style={getPaginationButtonStyle(!canNextPage)}
                >
                  <b>&gt;</b>|
                </button>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </>
  );
}
