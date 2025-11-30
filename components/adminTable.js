import Link from 'next/link';
import React from 'react';
import { useTable } from 'react-table';
import styles from './adminTable.module.css';

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

  return (
    <>
      <table {...getTableProps()} className={styles.table}>
        <thead>
          {headerGroups.map((headerGroup, index) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={index}>
              {headerGroup.headers.map((column, index) => (
                <th
                  {...column.getHeaderProps()}
                  className={styles.headerCell}
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
              <tr {...row.getRowProps()} className={styles.row} key={index}>
                {row.cells.map((cell, index) => {
                  return (
                    <td
                      {...cell.getCellProps()}
                      className={styles.cell}
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
            <td colSpan='4' className={styles.footer}>
              <div className={styles.paginationContainer}>
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
                <span className={styles.paginationInfo}>
                  {startEntry}-{endEntry} of {totalEntries}
                </span>
                <button
                  onClick={() => setPageIndex(0)}
                  disabled={!canPreviousPage}
                  className={`${styles.paginationButton} ${
                    !canPreviousPage
                      ? styles.paginationButtonDisabled
                      : styles.paginationButtonEnabled
                  }`}
                >
                  |<b>&lt;</b>
                </button>
                <button
                  onClick={() => setPageIndex(pageIndex - 1)}
                  disabled={!canPreviousPage}
                  className={`${styles.paginationButton} ${
                    !canPreviousPage
                      ? styles.paginationButtonDisabled
                      : styles.paginationButtonEnabled
                  }`}
                >
                  <b>&lt;</b>
                </button>
                <button
                  onClick={() => setPageIndex(pageIndex + 1)}
                  disabled={!canNextPage}
                  className={`${styles.paginationButton} ${
                    !canNextPage
                      ? styles.paginationButtonDisabled
                      : styles.paginationButtonEnabled
                  }`}
                >
                  <b>&gt;</b>
                </button>
                <button
                  onClick={() =>
                    setPageIndex(Math.ceil(totalEntries / entriesPerPage) - 1)
                  }
                  disabled={!canNextPage}
                  className={`${styles.paginationButton} ${
                    !canNextPage
                      ? styles.paginationButtonDisabled
                      : styles.paginationButtonEnabled
                  }`}
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
