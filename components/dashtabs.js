import DashTable from './dashtable';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import reactTabStyles from './dashTabs.module.css';
import { useState } from 'react';

export default function DashTabs(props) {
  const [tabIndex, setTabIndex] = useState(0);
  const [tabIndexName, setTabIndexName] = useState(props.certificationNames[0]);
  const [copied, setCopied] = useState(false);

  var columnNames = [...props.columns];
  const presetColumns = [
    {
      name: 'Student Name',
      selector: row => row['student-name'],
      dashedName: 'student-name'
    },
    {
      name: 'Student Activity',
      selector: row => row['student-activity'],
      dashedName: 'student-activity'
    }
  ];
  let columns = columnNames.map(x => {
    let finalColumns = presetColumns.concat(x);
    return finalColumns;
  });

  function determineItemStyle(x) {
    setTabIndexName(x);
  }

  function handleCopy() {
    navigator.clipboard.writeText(props.joinLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (props.fccUserIds.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>No students have joined this classroom yet.</p>
        <p>Share this link with your students to invite them:</p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '1rem'
          }}
        >
          <span
            style={{
              fontFamily: 'monospace',
              background: '#f3f3f3',
              padding: '0.5rem',
              borderRadius: '4px'
            }}
          >
            {props.joinLink}
          </span>
          <button onClick={handleCopy}>{copied ? 'Copied!' : 'Copy'}</button>
        </div>
      </div>
    );
  }

  if (props.fetchError && props.fetchError !== 'MISSING_URL') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>
          We couldn&apos;t load your students. Please try refreshing, or contact
          support at{' '}
          <a href='mailto:support@freecodecamp.org'>support@freecodecamp.org</a>{' '}
          if the problem persists.
        </p>
      </div>
    );
  }

  return (
    <>
      <Tabs selectedIndex={tabIndex} onSelect={index => setTabIndex(index)}>
        <TabList>
          {props.certificationNames.map((x, index) => (
            <Tab
              onClick={() => determineItemStyle(x)}
              className={
                x == tabIndexName
                  ? reactTabStyles.react_tabs__tab__selected
                  : reactTabStyles.react_tabs__tab
              }
              key={index}
            >
              {x}
            </Tab>
          ))}
        </TabList>
        {/*
          Here, we are mapping the columns array that holds our challenge names. These names are the columns of their own respective tables.
          We do not want to send unnecessary column names to our table so we are splitting them here by certification using 
          Tabs and Tablist to ensure they are sent to their respective Tab (Certification) 
        */}
        {columns.map(certification => (
          <TabPanel key={certification}>
            <DashTable
              columns={certification}
              data={props.studentData}
            ></DashTable>
          </TabPanel>
        ))}
      </Tabs>
    </>
  );
}
