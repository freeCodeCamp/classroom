import React from 'react';
import { Button, HeadlessDisclosure, Panel, Table } from '@freecodecamp/ui';
import ProgressBar from './ProgressBar';
import { getStudentTotalChallengesCompletedInBlock } from '../util/student/calculateProgress';

export default function DetailsDashboardList(props) {
  const getStudentsProgressInBlock = blockName => {
    return getStudentTotalChallengesCompletedInBlock(
      props.studentProgressInBlocks,
      blockName
    );
  };

  const completedInCertification = props.blockData.reduce(
    (total, block) => total + getStudentsProgressInBlock(block.selector),
    0
  );
  const challengesInCertification = props.blockData.reduce(
    (total, block) => total + block.allChallenges.length,
    0
  );

  return (
    <HeadlessDisclosure>
      {({ open }) => (
        <>
          <Panel.Heading className='flex flex-wrap items-center justify-between gap-x-4 gap-y-2'>
            <div className='flex-1 min-w-[200px]'>
              <Panel.Title>{props.superblockTitle}</Panel.Title>
              <div className='mt-2 max-w-sm'>
                <ProgressBar
                  value={completedInCertification}
                  max={challengesInCertification}
                  label={`Challenges completed in ${props.superblockTitle}`}
                />
              </div>
            </div>
            <HeadlessDisclosure.Button as={Button} size='small'>
              {open ? 'View less' : 'View details'}
            </HeadlessDisclosure.Button>
          </Panel.Heading>
          <HeadlessDisclosure.Panel as={Panel.Body}>
            {/* Long certifications scroll inside the panel (about 10 rows).
                The rows stay in the page, so browser find (Ctrl+F) still
                reaches them; tabIndex lets keyboard users scroll the box. */}
            <div
              className='max-h-[400px] overflow-y-auto'
              role='region'
              aria-label={`${props.superblockTitle} blocks`}
              tabIndex={0}
            >
              <Table striped condensed>
                <thead className='sticky top-0 bg-background-primary'>
                  <tr>
                    <th>Block</th>
                    <th>Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {props.blockData.map((blockDetails, idx) => (
                    <tr key={idx}>
                      <td>{blockDetails.blockName}</td>
                      <td>
                        {getStudentsProgressInBlock(blockDetails.selector)}/
                        {blockDetails.allChallenges.length}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </HeadlessDisclosure.Panel>
        </>
      )}
    </HeadlessDisclosure>
  );
}
