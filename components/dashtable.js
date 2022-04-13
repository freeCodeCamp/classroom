import DataTable from 'react-data-table-component';

// Dummy data that we plan to create an endpoint for
const data = [
  {
    id: 1,
    'Student Name': 'Guillermo',
    'Basic HTML and HTML5': '10/10',
    'Basic CSS': '0/10',
    'CSS Flexbox': '10/10',
    'CSS Grid': '7/10',
    'Regular Expressions': 'We need dummy data to populate this.',
    Debugging: '0/10',
    'Basic Data Structures': '4/10',
    'Basic Algorithm Scripting': '10/10'
  },
  {
    id: 2,
    'Student Name': 'Robert',
    'Basic HTML and HTML5': '8/10',
    'Basic CSS': '10/10',
    'CSS Flexbox': '9/10',
    'CSS Grid': '4/10',
    'Regular Expressions': 'We need dummy data to populate this.',
    Debugging: '10/10',
    'Basic Data Structures': '10/10',
    'Basic Algorithm Scripting': '10/10'
  }
];

export default function DashTable(props) {
  return <DataTable columns={props.columns} data={data} pagination />;
}
