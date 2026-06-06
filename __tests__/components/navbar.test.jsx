import Navbar from '../../components/navbar';
import React from 'react';
import { SessionProvider } from 'next-auth/react';
import renderer from 'react-test-renderer';
import Link from 'next/link';

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

  it('renders Classes link as "Classes" for non-admin session', () => {
    const tree = renderer
      .create(
        <SessionProvider session={{ user: { name: 'test user', role: 'TEACHER' } }}>
          <Navbar>
            <div>
              <Link href="/classes">Classes</Link>
            </div>
          </Navbar>
        </SessionProvider>
      )
      .toJSON();

    const jsonString = JSON.stringify(tree);
    expect(jsonString).toContain('Classes');
    expect(jsonString).not.toContain('Dashboard');
  });

  it('renders Classes link as "Dashboard" for ADMIN session', () => {
    const tree = renderer
      .create(
        <SessionProvider session={{ user: { name: 'admin user', role: 'ADMIN' } }}>
          <Navbar>
            <div>
              <Link href="/classes">Classes</Link>
            </div>
          </Navbar>
        </SessionProvider>
      )
      .toJSON();

    const jsonString = JSON.stringify(tree);
    expect(jsonString).toContain('Dashboard');
    expect(jsonString).not.toContain('Classes');
  });
});
