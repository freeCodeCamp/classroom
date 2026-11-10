import React from 'react';
import dynamic from 'next/dynamic';
import { Panel } from '@freecodecamp/ui';
import DetailsDashboardList from './DetailsDashboardList';
import { getStudentProgressInSuperblock } from '../util/student/calculateProgress';
import { extractFilteredCompletionTimestamps } from '../util/student/extractTimestamps';
import type { DashboardBlock } from '../types/curriculum';
import type { BlockProgress, StudentCertifications } from '../types/student';

// The chart uses the browser's date, time zone and language, which differ from
// the server's, so it is rendered in the browser only. The placeholder keeps
// its space so the page doesn't jump when it loads.
const StudentActivityChart = dynamic(() => import('./StudentActivityChart'), {
  ssr: false,
  loading: () => <div className='min-h-[220px]' aria-hidden='true' />
});

type DetailsDashboardProps = {
  superblocksDetailsJSONArray: DashboardBlock[][];
  studentData: StudentCertifications;
};

function printSuperblockTitle(arrayOfBlockObjs: DashboardBlock[]): string {
  // superblockReadableTitle is embedded on each block by createSuperblockDashboardObject
  // using a dashedName-based lookup, so we can read it directly rather than
  // matching by positional index against a separately-fetched titles array.
  return (
    arrayOfBlockObjs[0]?.superblockReadableTitle ||
    arrayOfBlockObjs[0]?.superblock ||
    ''
  );
}

export default function DetailsDashboard(
  props: DetailsDashboardProps
): React.JSX.Element {
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
