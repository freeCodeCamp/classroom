import React from 'react';
import { useState } from 'react';
import styles from './Details.module.css';

export default function DetailsList(props) {
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

  return (
    <>
      <div className={styles.list_container}>
        <h1>{props.superblockTitle}</h1>

        <button onClick={handleShowDetails}>{buttonText}</button>
      </div>
      <div className={styles.progress_container}>
        {hideDetails ? (
          ''
        ) : (
          <>
            <div className={styles.detail_list}>
              {props.blockData.map((data, idx) => {
                return (
                  <>
                    <div className={styles.list_item} key={idx}>
                      <h1>{data.blockName}</h1>
                      <h1>
                        {data.studentProgress.length}/
                        {data.allChallenges.length}
                      </h1>
                    </div>
                  </>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}
