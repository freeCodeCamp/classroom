import AdminTable from '../../components/adminTable';
import React from 'react';
import renderer from 'react-test-renderer';
const sampleColumns = [
    {
      name: 'Name',
      selector: row => row.name
    },
    {
      name: 'Email',
      selector: row => row.userEmail
    },
    {
      name: 'Role',
      selector: row => row.role
    },
    {
      name: 'Actions',
      selector: row => row.adminActions
    }
  ];
const sampleUsers=[
    {
        id: 1,
        name: "Hamzat Victor",
        email: "oluwaborihamzat@gmail.com",
        role: "ADMIN"
    },
    {
        id: 2,
        name: "Alade Christopher",
        email: "aladechristoph@gmail.com",
        role: "TEACHER"
    },
    {
        id: 3,
        name: "Ayomide onifade",
        email: "Jangulabi@gmail.com",
        role: "TEACHER"
    },
]

describe('AdminTable rendering correctly', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create(
          <AdminTable  data={sampleUsers} columns={sampleColumns}/>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
