// components/dashtable_v2.js
import { useTable } from 'react-table';
import React, { useMemo } from 'react';
import { processDashboardData } from '../util/processDashboardData';

export default function GlobalDashboardTable(props) {
  const { data, columns } = useMemo(() => processDashboardData(props), [props]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });

  return (
    <table
      {...getTableProps()}
      style={{ border: 'solid 1px blue', width: '100%', margin: 'auto' }}
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
  );
}
