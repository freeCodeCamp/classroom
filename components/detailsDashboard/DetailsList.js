import React from 'react';
import styles from './../Details.module.css';
import { useState } from 'react';
import DetailsProgress from './DetailsProgress';

export default function DetailsList(props) {
  const [showList, setShowList] = useState(false);

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
            <h1>Item</h1>
            <DetailsProgress progress={'0/100'} />
          </div>
        ) : (
          ''
        )}
      </div>
    </>
  );
}
