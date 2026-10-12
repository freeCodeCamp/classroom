import AdminTable from '../../components/adminTable';
import React, { act } from 'react';
import renderer from 'react-test-renderer';
import type { ReactTestRenderer } from 'react-test-renderer';
import type { ComponentProps } from 'react';
const sampleUsers = [
  {
    id: 1,
    name: 'Hamzat Victor',
    email: 'oluwaborihamzat@gmail.com',
    role: 'ADMIN'
  },
  {
    id: 2,
    name: 'Alade Christopher',
    email: 'aladechristoph@gmail.com',
    role: 'TEACHER'
  },
  {
    id: 3,
    name: 'Ayomide onifade',
    email: 'Jangulabi@gmail.com',
    role: 'TEACHER'
  }
] as unknown as ComponentProps<typeof AdminTable>['data'];

describe('AdminTable', () => {
  it('displays 3 rows of data with expected column names: name, email, role, action', () => {
    let root!: ReactTestRenderer;
    act(() => {
      root = renderer.create(<AdminTable data={sampleUsers} />);
    });
    expect(root.toJSON()).toMatchSnapshot();
  });
});
