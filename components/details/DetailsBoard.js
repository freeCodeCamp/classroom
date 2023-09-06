import React from 'react';
import DetailsList from './DetailsList';

import styles from './Details.module.css';
export default function DetailsBoard(props) {
  let allCurriculumData = props.superblockDashboardData;
  let studentData = props.studentCurriculumData;
  let titleInfo = props.superblockTitleInfo;

  let mergedDashboardData = [];

  // reshape data to pass into UI
  allCurriculumData.forEach(superblockData => {
    superblockData.forEach(superblockDetails => {
      let superblockMatcher = superblockDetails.superblock;
      let blockMatcher = superblockDetails.selector;
      let studentProgressInBlock = { studentProgress: [] };
      studentData.forEach(studentProgress => {
        studentProgress.blocks.forEach(blockProgress => {
          if (
            blockProgress.superblock === superblockMatcher &&
            blockProgress.blockName === blockMatcher
          ) {
            studentProgressInBlock.studentProgress =
              blockProgress.challengeData;
          }
        });
      });

      mergedDashboardData.push({
        ...superblockDetails,
        ...studentProgressInBlock
      });
    });
  });

  // includes readable title as parent most key see getNonDashedNamesURLs() in api_processor.js
  let allMergedData = [];

  for (let i = 0; i < titleInfo.length; i++) {
    let tempObj = { title: titleInfo[i].title, data: [] };
    mergedDashboardData.forEach(mergedData => {
      if (mergedData.superblock === titleInfo[i].dashedName) {
        tempObj.data.push(mergedData);
      }
    });
    allMergedData.push(tempObj);
  }
  return (
    <>
      <div className={styles.board_container}>
        {allMergedData.map((info, idx) => {
          return (
            <DetailsList
              key={idx}
              superblockTitle={info.title}
              blockData={info.data}
            ></DetailsList>
          );
        })}
      </div>
    </>
  );
}
