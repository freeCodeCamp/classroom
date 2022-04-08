import Tabs from 'react-tabs/lib/components/Tabs';
import Tab from 'react-tabs/lib/components/Tab';
import DashTable from './dashtable';
import { TabPanel } from 'react-tabs';
import { TabList } from 'react-tabs';

export default function DashTabs(props) {
  var arrayForConcat = [...props.columns];
  for (let i = 0; i < arrayForConcat.length; i += 1) {
    let presetColumns = [];
    presetColumns.push({ name: 'Student Name', selector: 'Student Name' });
    arrayForConcat[i] = presetColumns.concat(arrayForConcat[i]);
    for (let k in Object.keys(arrayForConcat[i])) {
      arrayForConcat[i][k]['selector'] = row =>
        row[arrayForConcat[i][k]['name']];
    }
  }
  return (
    <Tabs>
      <TabList forceRenderTabPanel>
        {props.certificationNames.map(x => (
          <Tab key={x}>{x}</Tab>
        ))}
      </TabList>
      {arrayForConcat.map(arrayForConcat => (
        <TabPanel key={1}>
          <DashTable columns={arrayForConcat} data={null}></DashTable>
        </TabPanel>
      ))}
    </Tabs>
  );
}
