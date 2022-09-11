import Link from 'next/link';
import DataTable from 'react-data-table-component';

export default function AdminTable(props) {
  let teachers = props.data.map(i => {
    let teacherObj = {};
    teacherObj['teacherName'] = i.name;
    teacherObj['teacherEmail'] = i.email;
    teacherObj['role'] = i.role;
    teacherObj['adminActions'] = (
      <Link href={`/admin/actions/${i.id}`}>View Possible Actions</Link>
    );
    return teacherObj;
  });

  return <DataTable columns={props.columns} data={teachers} pagination />;
}
