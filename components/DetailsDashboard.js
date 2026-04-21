import React from 'react';
import styles from './DetailsCSS.module.css';
import DetailsDashboardList from './DetailsDashboardList';
import { getStudentProgressInSuperblock } from '../util/student/calculateProgress';
import { extractFilteredCompletionTimestamps } from '../util/student/extractTimestamps';
import StudentActivityChart from './StudentActivityChart';

export default function DetailsDashboard(props) {
  const printSuperblockTitle = arrayOfBlockObjs => {
    // superblockReadableTitle is embedded on each block by createSuperblockDashboardObject
    // using a dashedName-based lookup, so we can read it directly rather than
    // matching by positional index against a separately-fetched titles array.
    return (
      arrayOfBlockObjs[0]?.superblockReadableTitle ||
      arrayOfBlockObjs[0]?.superblock ||
      ''
    );
  };

  const superblockProgress = superblockDashedName => {
    let studentProgress = props.studentData;

    return getStudentProgressInSuperblock(
      studentProgress,
      superblockDashedName
    );
  };

  const selectedSuperblocks = props.superblocksDetailsJSONArray.map(
    arrayOfBlockObjs => arrayOfBlockObjs[0].superblock
  );
  const filteredCompletionTimestamps = extractFilteredCompletionTimestamps(
    props.studentData.certifications,
    selectedSuperblocks
  );

  return (
    <>
      <StudentActivityChart timestamps={filteredCompletionTimestamps} />
      {props.superblocksDetailsJSONArray.map((arrayOfBlockObjs, idx) => {
        let index = props.superblocksDetailsJSONArray.indexOf(arrayOfBlockObjs);
        let superblockDashedName =
          props.superblocksDetailsJSONArray[index][0].superblock;
        let progressInBlocks = superblockProgress(superblockDashedName);
        let superblockTitle = printSuperblockTitle(arrayOfBlockObjs);
        return (
          <div key={idx} className={styles.board_container}>
            <DetailsDashboardList
              superblockTitle={superblockTitle}
              blockData={arrayOfBlockObjs}
              studentProgressInBlocks={progressInBlocks}
            ></DetailsDashboardList>
          </div>
        );
      })}
    </>
  );
}
