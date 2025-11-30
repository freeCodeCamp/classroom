import DataTable from 'react-data-table-component';

export default function AdminTable({ columns, data }) {
  return (
    <div className='p-4'>
      <DataTable
        columns={columns}
        data={data}
        pagination
        highlightOnHover
        striped
      />
    </div>
  );
}
