import React from 'react';
import styles from './../Details.module.css';
import { useState } from 'react';
import DetailsProgress from './DetailsProgress';

export default function DetailsList(props) {
  const [showList, setShowList] = useState(false);

  const data = props.superblockData;
  // console.log('====== data', data)

  const getChallengeTitles = arrayOfObjects => {
    let titles = [];

    arrayOfObjects.forEach(challengeObject => {
      titles.push(Object.keys(challengeObject));
    });

    return titles.flat();
  };

  // const getChallengeProgress = () => {
  //   // some calculation
  // }

  let challengeTitles = getChallengeTitles(data);
  console.log('====== TITLES', challengeTitles);
  const handleShowList = () => {
    if (showList) {
      setShowList(false);
    } else {
      setShowList(true);
    }
  };
  return (
    <>
      <div className={styles.list_container}>
        <div className={styles.list_header}>
          <h1>{props.title}</h1>
          <div className={styles.show_button} onClick={handleShowList}>
            Show items
          </div>
        </div>
        {showList ? (
          <div className={styles.list_items}>
            <div className={styles.challenge_title}>
              {challengeTitles.map((title, idx) => {
                return (
                  <div className={styles.challenge_data} key={idx}>
                    {title} <DetailsProgress progress={'0/100'} />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          ''
        )}
      </div>
    </>
  );
}
