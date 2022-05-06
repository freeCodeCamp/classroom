import DataTable from 'react-data-table-component';

//intersection of 2 sets in O(n) time from MDN docs
function intersection(setA, setB) {
  let _intersection = new Set();
  for (let elem of setB) {
    if (setA.has(elem)) {
      _intersection.add(elem);
    }
  }
  return _intersection;
}

//example of how student data is supposed to look like when passed into the table
// const old = [
//   {
//     id: 1,
//     'student-name': 'Guillermo',
//     'basic-html-and-html5': '10/10',
//     'basic-css': '0/10',
//     'css-flexbox': '10/10',
//     'css-grid': '7/10',
//     'regular-expressions': '0/10',
//     debugging: '0/10',
//     'basic-data-structures': '4/10',
//     'basic-algorithm-scripting': '10/10'
//   },
//   {
//     id: 2,
//     'student-name': 'Robert',
//     'basic-html-and-html5': '10/10',
//     'basic-css': '0/10',
//     'css-flexbox': '10/10',
//     'css-grid': '7/10',
//     'regular-expressions': '0/10',
//     debugging: '0/10',
//     'basic-data-structures': '4/10',
//     'basic-algorithm-scripting': '10/10'
//   }
// ];

export default function DashTable(props) {
  let output = [];

  for (let i = 0; i < props.data.length; i++) {
    let values = {};
    values.map;
    let studentName = Object.keys(props.data[i])[0];
    for (const x of props.columns) {
      if (x.selector !== 'student-name') {
        values[x.selector] = intersection(
          new Set(x.allChallenges),
          new Set(props.data[i][studentName])
        ).size;
      } else {
        values[x.selector] = studentName;
      }
    }
    output.push(values);
  }

  return <DataTable columns={props.columns} data={output} pagination />;
}
