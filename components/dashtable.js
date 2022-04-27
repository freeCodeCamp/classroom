import DataTable from 'react-data-table-component';

// Dummy data that we plan to create an endpoint for
const data = [
  {
    id: 1,
    'student-name': 'Guillermo',
    'basic-html-and-html5': '10/10',
    'basic-css': '0/10',
    'css-flexbox': '10/10',
    'css-grid': '7/10',
    'regular-expressions': 'We need dummy data to populate this.',
    debugging: '0/10',
    'basic-data-structures': '4/10',
    'basic-algorithm-scripting': '10/10'
  },
  {
    id: 2,
    'student-name': 'Robert',
    'basic-html-and-html5': '10/10',
    'basic-css': '0/10',
    'css-flexbox': '10/10',
    'css-grid': '7/10',
    'regular-expressions': 'We need dummy data to populate this.',
    debugging: '0/10',
    'basic-data-structures': '4/10',
    'basic-algorithm-scripting': '10/10'
  }
];

export default function DashTable(props) {
  return <DataTable columns={props.columns} data={data} pagination />;
}
