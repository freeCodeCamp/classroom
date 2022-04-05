import DataTable from 'react-data-table-component';

// const columns = [
//     {
//         name: 'Title',
//         selector: row => row.title,
//     },
//     {
//         name: 'Year',
//         selector: row => row.year,
//     },
//     {
//         name: 'Age',
//     },

// ];

const data = [
  {
    id: 1,
    'basic-css': 'Beetlejuice'
  },
  {
    id: 2,
    'basic-css': 'Beetlejuice'
  }
];

export default function DashTable(columns) {
  columns = columns['columns'];
  for (var i = 0; i <= columns.length; i += 1) {
    console.log(columns[i]);
    // columns[i]["selector"] = row => row.columns[i]["name"]
  }

  return <DataTable columns={columns} data={data} />;
}
