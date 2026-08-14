import Navbar from '../../components/navbar';
import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
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
