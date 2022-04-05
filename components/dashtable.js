import DataTable from 'react-data-table-component';

const data = [
  {
    id: 1,
    'Student Name': 'Guillermo',
    'basic-html-and-html5': '10/10',
    'basic-css': '0/10',
    'css-flexbox': '10/10',
    'css-grid': '7/10'
  },
  {
    id: 2,
    'Student Name': 'Robert',
    'basic-css': 'We need dummy data to populate this.',
    'basic-html-and-html5': '10/10',
    'css-flexbox': '10/10',
    'applied-accessibility': '2/10'
  }
];

export default function DashTable(tableData) {
  let columns = tableData['columns'];
  let presetColumns = [];
  presetColumns.push({ name: 'Student Name' });
  columns = presetColumns.concat(columns);
  for (let i = 0; i < columns.length; i += 1) {
    columns[i]['selector'] = row => row[columns[i]['name']];
  }

  return <DataTable columns={columns} data={data} />;
}
