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
  // The outer loop corresponds to each individual certification
  for (let i = 0; i < columnNames.length; i += 1) {
    let presetColumns = [];
    presetColumns.push({ name: 'Student Name', selector: 'Student Name' });
    columnNames[i] = presetColumns.concat(columnNames[i]);
    // This inner loop adds the name of the column for each specific certification
    for (let k in Object.keys(columnNames[i])) {
      console.log(columnNames[i][k]);
      columnNames[i][k]['selector'] = row => row[columnNames[i][k]['name']];
    }
  }
  // This function sets the tab name which later gives our selected tab selected styling
  function determineItemStyle(x) {
    setTabIndexName(x);
  }

  return (
    <>
      <Tabs selectedIndex={tabIndex} onSelect={index => setTabIndex(index)}>
        <TabList>
          {props.certificationNames.map(x => (
            <Tab
              onClick={() => determineItemStyle(x)}
              className={
                x == tabIndexName
                  ? reactTabStyles.react_tabs__tab__selected
                  : reactTabStyles.react_tabs__tab
              }
              key={x}
            >
              {x}
            </Tab>
          ))}
        </TabList>
        {columnNames.map(x => (
          <TabPanel key={x}>
            <DashTable columns={x} data={null}></DashTable>
          </TabPanel>
        ))}
      </Tabs>
    </>
  );
}
