import React from 'react';
import { useState } from 'react';
import styles from './DetailsCSS.module.css';
import { getStudentTotalChallengesCompletedInBlock } from '../util/api_proccesor';

export default function DetailsDashboardList(props) {
  const [hideDetails, setHideDetails] = useState(true);
  const [buttonText, setButtonText] = useState('View details');

  const handleShowDetails = () => {
    if (hideDetails) {
      setHideDetails(false);
    } else {
      setHideDetails(true);
    }

    handleButtonText(hideDetails);
  };

  const handleButtonText = hideDetails => {
    if (hideDetails) {
      setButtonText('View less');
    } else {
      setButtonText('View details');
    }
  };

  const getStudentsProgressInBlock = blockName => {
    return getStudentTotalChallengesCompletedInBlock(
      props.studentProgressInBlocks,
      blockName
    );
  };

  return (
    <>
      <div className={styles.list_container}>
        <h1>{props.superblockTitle} </h1>

        <button onClick={handleShowDetails}>{buttonText}</button>
      </div>
      <div className={styles.inner_comp}>
        {hideDetails ? (
          ''
        ) : (
          <>
            <ul>
              <li>
                {props.blockData.map((blockDetails, idx) => {
                  return (
                    <div className={styles.details_progress_stats} key={idx}>
                      <h1 className={styles.detailsBlockTitle}>
                        {blockDetails.blockName}
                      </h1>
                      <h1 className={styles.focus}>
                        {getStudentsProgressInBlock(blockDetails.selector) +
                          '/' +
                          blockDetails.allChallenges.length}
                      </h1>
                    </div>
                  );
                })}
              </li>
            </ul>
          </>
        )}
      </div>
    </>
  );
}
