import Navbar from '../../components/navbar';
import React from 'react';
import { SessionProvider } from 'next-auth/react';
import renderer from 'react-test-renderer';

describe('Navbar rendering correctly', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create(
        <SessionProvider session={{ user: { name: 'test user' } }}>
          <Navbar />
        </SessionProvider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
