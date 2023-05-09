import Navbar from '../../components/navbar';
import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { render } from '@testing-library/react';

describe('Navbar rendering correctly', () => {
  it('renders correctly', () => {
    const component = render(
      <SessionProvider session={{ user: { name: 'test user' } }}>
        <Navbar />
      </SessionProvider>
    );
    expect(component).toMatchSnapshot();
  });
});
