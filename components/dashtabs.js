import DashTable from './dashtable';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import reactTabStyles from './dashTabs.module.css';
import { useState } from 'react/cjs/react.development';

export default function DashTabs(props) {
  const [tabIndex, setTabIndex] = useState(0);
  // This sets our selected tab to our first index of certification module names
  const [tabIndexName, setTabIndexName] = useState(props.certificationNames[0]);
  // Here we are copying the columns array (which is now immutable) in order to be able to add the Student Name column to it
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

  // This function sets the tab name which later gives our selected tab selected styling
  function determineItemStyle(x) {
    setTabIndexName(x);
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
