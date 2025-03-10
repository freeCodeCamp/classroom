import React from 'react';
import styles from './DetailsCSS.module.css';
import DetailsDashboardList from './DetailsDashboardList';
import {
  getStudentProgressInSuperblock,
  extractFilteredCompletionTimestamps
} from '../util/api_proccesor';
import StudentActivityChart from './StudentActivityChart';

export default function DetailsDashboard(props) {
  const printSuperblockTitle = individualSuperblockJSON => {
    let indexOfTitleInSuperblockTitlesArray =
      props.superblocksDetailsJSONArray.indexOf(individualSuperblockJSON);
    let superblockTitle =
      props.superblockTitles[indexOfTitleInSuperblockTitlesArray];
    return superblockTitle;
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
      {selectedSuperblocks.length > 0 ? (
        <StudentActivityChart timestamps={filteredCompletionTimestamps} />
      ) : (
        <p className={styles.no_certification}>
          No certifications selected for this class.
        </p>
      )}
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
