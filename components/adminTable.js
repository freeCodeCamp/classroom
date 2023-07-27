import Link from 'next/link';
import DataTable from 'react-data-table-component';
import dynamic from 'next/dynamic';

function AdminTable(props) {
  let users = props.data.map(i => {
    let userObj = {};
    userObj['name'] = i.name;
    userObj['userEmail'] = i.email;
    userObj['role'] = i.role;
    userObj['adminActions'] = (
      <Link href={`/admin/actions/${i.id}`}>View Possible Actions</Link>
    );
    return userObj;
  });

  return <DataTable columns={props.columns} data={users} pagination />;
}

export default dynamic(() => Promise.resolve(AdminTable), { ssr: false });
