import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../../pages/index';

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() }))
}));

const renderHome = ({ role = null, isSignedIn = Boolean(role) } = {}) =>
  render(
    <SessionProvider
      session={isSignedIn ? { user: { name: 'user', role } } : null}
    >
      <Home isSignedIn={isSignedIn} role={role} />
    </SessionProvider>
  );

describe('Home page onboarding', () => {
  it('invites signed-out visitors to sign in and shows both guides', () => {
    renderHome();

    expect(screen.getAllByRole('button', { name: 'Sign in' })).not.toHaveLength(
      0
    );
    expect(screen.getByRole('tab', { name: 'For teachers' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByText('Teaching with Classroom')).toBeVisible();
    expect(screen.getByRole('tab', { name: 'For students' })).toBeVisible();
  });

  it('shows a teacher their role and a link to their classes', () => {
    renderHome({ role: 'TEACHER' });

    expect(screen.getByText('a Teacher')).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Go to your classes' })
    ).toHaveAttribute('href', '/classes');
  });

  it('shows students only the student guide, without tabs', () => {
    renderHome({ role: 'STUDENT' });

    expect(screen.getByText('a Student')).toBeVisible();
    expect(screen.getByText('Joining a class')).toBeVisible();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Teaching with Classroom')
    ).not.toBeInTheDocument();
  });

  it('gives admins a pointer to the admin dashboard', () => {
    renderHome({ role: 'ADMIN' });

    expect(screen.getByText('an Admin')).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'admin dashboard' })
    ).toHaveAttribute('href', '/admin');
  });

  it('welcomes a signed-in account that has no role yet', () => {
    renderHome({ role: 'NONE', isSignedIn: true });

    expect(
      screen.getByText(
        'Welcome to FreeCodeCamp Classroom! Follow the steps below to get started!'
      )
    ).toBeVisible();
    expect(screen.getByRole('tab', { name: 'For teachers' })).toBeVisible();
  });

  it('switches to the student guide from its tab', () => {
    renderHome({ role: 'TEACHER' });

    fireEvent.mouseDown(screen.getByRole('tab', { name: 'For students' }));

    expect(screen.getByText('Joining a class')).toBeVisible();
  });
});
