import Tabs from 'react-tabs/lib/components/Tabs';
import TabList from 'react-tabs/lib/components/TabList';

export default function DashTabs(tabledatas) {
  console.log(tabledatas);
  return (
    <Tabs>
      <TabList></TabList>
    </Tabs>
  );
}
