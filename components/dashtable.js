import DataTable from 'react-data-table-component';

//from MDN docs
function intersection(setA, setB) {
  let _intersection = new Set();
  for (let elem of setB) {
    if (setA.has(elem)) {
      _intersection.add(elem);
    }
  }
  return _intersection;
}

// Dummy data that we plan to create an endpoint for
// const old = [
//   {
//     id: 1,
//     'student-name': 'Guillermo',
//     'basic-html-and-html5': '10/10',
//     'basic-css': '0/10',
//     'css-flexbox': '10/10',
//     'css-grid': '7/10',
//     'regular-expressions': 'We need dummy data to populate this.',
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
//     'regular-expressions': 'We need dummy data to populate this.',
//     debugging: '0/10',
//     'basic-data-structures': '4/10',
//     'basic-algorithm-scripting': '10/10'
//   }
// ];

export default function DashTable(props) {
  let output = [];
  for (let i = 0; i < props.data.length; i++) {
    let studentName = Object.keys(props.data[i])[0];
    let values = props.columns.map(x => {
      let userOutput = {};
      if (x.selector !== 'student-name') {
        userOutput[x.selector] = intersection(
          new Set(x.allChallenges),
          new Set(props.data[i][studentName])
        ).size;
      } else {
        userOutput[x.selector] = studentName;
      }
      return userOutput;
    });
    values.unshift({ id: i + 1 });
    output.push(values);
  }
  console.log(output);
  return <DataTable columns={props.columns} data={output} pagination />;
}
