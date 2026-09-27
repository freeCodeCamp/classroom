import Navbar, { getNavLinks } from '../../components/navbar';
import React from 'react';
import { SessionProvider } from 'next-auth/react';
import renderer from 'react-test-renderer';
import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() }))
}));

const renderNavbar = (session, props = {}) =>
  render(
    <SessionProvider session={session}>
      <Navbar {...props} />
    </SessionProvider>
  );

// The inline link list (shown from 768px up).
const inlineLinks = () =>
  within(screen.getByRole('list'))
    .getAllByRole('link')
    .map(link => [link.textContent, link.getAttribute('href')]);

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

  it('links the logo to the home page', () => {
    renderNavbar(null);
    expect(
      screen.getByRole('link', { name: 'freeCodeCamp Classroom home' })
    ).toHaveAttribute('href', '/');
  });

  it('shows Classes and Home for a TEACHER session', () => {
    renderNavbar({ user: { name: 'test user', role: 'TEACHER' } });
    expect(inlineLinks()).toEqual([
      ['Classes', '/classes'],
      ['Home', '/']
    ]);
  });

  it('shows Dashboard (the admin page) and Home for an ADMIN session', () => {
    renderNavbar({ user: { name: 'admin user', role: 'ADMIN' } });
    expect(inlineLinks()).toEqual([
      ['Dashboard', '/admin'],
      ['Home', '/']
    ]);
  });

  it('shows only Home for a STUDENT session', () => {
    renderNavbar({ user: { name: 'student user', role: 'STUDENT' } });
    expect(inlineLinks()).toEqual([['Home', '/']]);
  });

  it('shows only Home when signed out', () => {
    renderNavbar(null);
    expect(inlineLinks()).toEqual([['Home', '/']]);
  });

  it('puts page-specific links first', () => {
    expect(
      getNavLinks('TEACHER', [{ href: '/dashboard/v2/c1', label: 'Back' }])
    ).toEqual([
      { href: '/dashboard/v2/c1', label: 'Back' },
      { href: '/classes', label: 'Classes' },
      { href: '/', label: 'Home' }
    ]);
  });

  it('offers the same links in the phone Menu dropdown', () => {
    renderNavbar({ user: { name: 'test user', role: 'TEACHER' } });

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));

    expect(
      screen.getAllByRole('menuitem').map(item => item.textContent)
    ).toEqual(['Classes', 'Home']);
  });
});
