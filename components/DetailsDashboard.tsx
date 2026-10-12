import React from 'react';
import { Panel } from '@freecodecamp/ui';
import DetailsDashboardList from './DetailsDashboardList';
import { getStudentProgressInSuperblock } from '../util/student/calculateProgress';
import { extractFilteredCompletionTimestamps } from '../util/student/extractTimestamps';
import StudentActivityChart from './StudentActivityChart';
import type { DashboardBlock } from '../types/curriculum';
import type { BlockProgress, StudentCertifications } from '../types/student';

type DetailsDashboardProps = {
  superblocksDetailsJSONArray: DashboardBlock[][];
  studentData: StudentCertifications;
};

export default function DetailsDashboard(
  props: DetailsDashboardProps
): React.JSX.Element {
  const printSuperblockTitle = (arrayOfBlockObjs: DashboardBlock[]): string => {
    // superblockReadableTitle is embedded on each block by createSuperblockDashboardObject
    // using a dashedName-based lookup, so we can read it directly rather than
    // matching by positional index against a separately-fetched titles array.
    return (
      arrayOfBlockObjs[0]?.superblockReadableTitle ||
      arrayOfBlockObjs[0]?.superblock ||
      ''
    );
  };

  const superblockProgress = (
    superblockDashedName: string
  ): BlockProgress[] => {
    const studentProgress = props.studentData;

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
        const index =
          props.superblocksDetailsJSONArray.indexOf(arrayOfBlockObjs);
        const superblockDashedName =
          props.superblocksDetailsJSONArray[index][0].superblock;
        const progressInBlocks = superblockProgress(superblockDashedName);
        const superblockTitle = printSuperblockTitle(arrayOfBlockObjs);
        return (
          <Panel key={idx}>
            <DetailsDashboardList
              superblockTitle={superblockTitle}
              blockData={arrayOfBlockObjs}
              studentProgressInBlocks={progressInBlocks}
            ></DetailsDashboardList>
          </Panel>
        );
      })}
    </>
  );
}
