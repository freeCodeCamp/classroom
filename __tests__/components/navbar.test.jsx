import Navbar from '../../components/navbar';
import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
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

  it('renders Classes link as "Classes" for TEACHER session', () => {
    const tree = renderer
      .create(
        <SessionProvider
          session={{ user: { name: 'test user', role: 'TEACHER' } }}
        >
          <Navbar>
            <div>
              <Link href='/classes'>Classes</Link>
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
        <SessionProvider
          session={{ user: { name: 'admin user', role: 'ADMIN' } }}
        >
          <Navbar>
            <div>
              <Link href='/classes'>Classes</Link>
            </div>
          </Navbar>
        </SessionProvider>
      )
      .toJSON();

    const jsonString = JSON.stringify(tree);
    expect(jsonString).toContain('Dashboard');
    expect(jsonString).not.toContain('Classes');
  });

  it('hides Classes link for STUDENT session', () => {
    const tree = renderer
      .create(
        <SessionProvider
          session={{ user: { name: 'student user', role: 'STUDENT' } }}
        >
          <Navbar>
            <div>
              <Link href='/classes'>Classes</Link>
            </div>
          </Navbar>
        </SessionProvider>
      )
      .toJSON();

    const jsonString = JSON.stringify(tree);
    expect(jsonString).not.toContain('Classes');
    expect(jsonString).not.toContain('Dashboard');
  });

  it('hides Classes link for unauthenticated session', () => {
    const tree = renderer
      .create(
        <SessionProvider session={null}>
          <Navbar>
            <div>
              <Link href='/classes'>Classes</Link>
            </div>
          </Navbar>
        </SessionProvider>
      )
      .toJSON();

    const jsonString = JSON.stringify(tree);
    expect(jsonString).not.toContain('Classes');
    expect(jsonString).not.toContain('Dashboard');
  });
});

describe('Navbar Home button', () => {
  const findHomeLink = () => screen.getByRole('link', { name: /freecodecamp logo/i });

  it('points to the application home page when logged in as a teacher', () => {
    render(
      <SessionProvider session={{ user: { name: 'teacher', role: 'TEACHER' } }}>
        <Navbar />
      </SessionProvider>
    );
    expect(findHomeLink()).toHaveAttribute('href', '/');
  });

  it('points to the application home page when logged in as an admin', () => {
    render(
      <SessionProvider session={{ user: { name: 'admin', role: 'ADMIN' } }}>
        <Navbar />
      </SessionProvider>
    );
    expect(findHomeLink()).toHaveAttribute('href', '/');
  });

  it('points to the application home page when logged in as another role', () => {
    render(
      <SessionProvider session={{ user: { name: 'student', role: 'STUDENT' } }}>
        <Navbar />
      </SessionProvider>
    );
    expect(findHomeLink()).toHaveAttribute('href', '/');
  });

  it('points to the application home page when not logged in', () => {
    render(
      <SessionProvider session={null}>
        <Navbar />
      </SessionProvider>
    );
    expect(findHomeLink()).toHaveAttribute('href', '/');
  });
});
