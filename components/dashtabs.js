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
  const presetColumns = [{ name: 'Student Name', selector: 'student-name' }];
  let columns = columnNames.map(x => {
    let finalColumns = presetColumns.concat(x);
    return finalColumns;
  });

  // This reduces the columns array from 3D to a 2D array. 3D array creation occured inside of [id].js when we were mapping everything.
  // Not necessarily a good long term fix, will look into ways of shortening it inside of [id].js
  //columns = columns.flat(1);

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
