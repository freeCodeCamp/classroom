import React from 'react';
import { Button, HeadlessDisclosure } from '@freecodecamp/ui';
import styles from './DetailsCSS.module.css';
import { getStudentTotalChallengesCompletedInBlock } from '../util/student/calculateProgress';

export default function DetailsDashboardList(props) {
  const getStudentsProgressInBlock = blockName => {
    return getStudentTotalChallengesCompletedInBlock(
      props.studentProgressInBlocks,
      blockName
    );
  };

  return (
    <HeadlessDisclosure>
      {({ open }) => (
        <>
          <div className={styles.list_container}>
            <h1>{props.superblockTitle} </h1>

            <HeadlessDisclosure.Button as={Button} size='small'>
              {open ? 'View less' : 'View details'}
            </HeadlessDisclosure.Button>
          </div>
          <HeadlessDisclosure.Panel className={styles.inner_comp}>
            <ul>
              <li>
                {props.blockData.map((blockDetails, idx) => {
                  return (
                    <div className={styles.details_progress_stats} key={idx}>
                      <span className={styles.detailsBlockTitle}>
                        {blockDetails.blockName}
                      </span>
                      <span className={styles.focus}>
                        {getStudentsProgressInBlock(blockDetails.selector) +
                          '/' +
                          blockDetails.allChallenges.length}
                      </span>
                    </div>
                  );
                })}
              </li>
            </ul>
          </HeadlessDisclosure.Panel>
        </>
      )}
    </HeadlessDisclosure>
  );
}
