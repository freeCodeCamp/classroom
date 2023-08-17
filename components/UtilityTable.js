export default function UtilityTable(props) {
  return (
    <>
      <table
        {...props.getTableProps}
        style={{ border: 'solid 1px #0a0a23', width: '100%', margin: 'auto' }}
      >
        <thead>
          {props.headerGroups.map((headerGroup, index) => (
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
        <tbody {...props.getTableBodyProps}>
          {props.rows.map((row, index) => {
            props.prepareRow(row);
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
