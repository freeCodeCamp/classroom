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
export default function DashTable(props) {
  return <DataTable columns={props.columns} data={data} />;
}
