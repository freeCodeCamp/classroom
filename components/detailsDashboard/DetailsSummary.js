import React from 'react';
import DetailsList from './DetailsList';
export default function DetailsSummary(props) {
  // props.superblockData is an array of objects, where the key is dynamic, i.e.,
  // [ {2022-web: data}, {data-analysis: data}]

  // using a forEach and Object.keys allows for accessing these dynamic keys
  let studentSuperblocks = props.superblockData;
  return (
    <>
      <ul>
        {' '}
        {/* React JSX requires a .map in render */}
        {studentSuperblocks.map((superblock, idx) => {
          return (
            <DetailsList
              key={idx}
              title={Object.keys(superblock)[0]}
              superblockData={superblock}
            />
          );
        })}
      </ul>
    </>
  );
}
