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

export default function DashTable(props) {
  let output = Object.entries(props.columns).map(([i]) => {
    if (props.data[i] != null) {
      let studentName = Object.keys(props.data[Number(i)])[0];
      let userOutput = {};
      userOutput['id'] = Number(i) + 1;
      // This loops through all out columns and populates the data accordingly. Because we are looping through the columns, we will have 'props.columns.length' objects inside of values, but we will filter them out later.
      let values = props.columns.map(x => {
        if (x.selector !== 'student-name') {
          let intersectionSize = intersection(
            new Set(x.allChallenges),
            new Set(props.data[i][studentName])
          ).size;
          userOutput[
            x.selector
          ] = `${intersectionSize}/${x.allChallenges.length}`;
        } else {
          userOutput[x.selector] = studentName;
        }
        // This returns our user object when it is completed, otherwise we return undefined to our values array (which we will filter out later)
        if (Object.keys(userOutput).length == props.columns.length) {
          return userOutput;
        }
      });
      // Filters out undefined parts of values
      values = values.filter(obj => typeof obj == 'object');
      return values;
    }
  });
  // Filters out any possible undefined objs
  output = output.filter(obj => typeof obj == 'object');
  //turns our output array to a 1D array instead of 2D
  output = output.flat(1);
  return <DataTable columns={props.columns} data={output} pagination />;
}
