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
  let finalColumns = columnNames.map(x => {
    let column = x.map(x => {
      let column2 = x.map(x => {
        return x;
      });
      let presetColumns = [{ name: 'Student Name', selector: 'student-name' }];
      presetColumns = presetColumns.concat(column2);
      return presetColumns;
    });
    return column;
  });
  console.log(finalColumns);

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
        {finalColumns.map(x => (
          <TabPanel key={x.selector}>
            <DashTable
              columns={finalColumns}
              data={props.studentData}
            ></DashTable>
          </TabPanel>
        ))}
      </Tabs>
    </>
  );
}
