import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorPage from '../../pages/error';

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() }))
}));

describe('Error page', () => {
  it('tells students the area is not for them', () => {
    const session = { user: { name: 'student', role: 'STUDENT' } };
    render(
      <SessionProvider session={session}>
        <ErrorPage
          hasSession
          hasUser
          role='STUDENT'
          inviteStatus={null}
          reason={null}
        />
      </SessionProvider>
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Student Access' })
    ).toBeVisible();
    expect(
      screen.getByText(
        'This area is not accessible to students. Ask your teacher for help if you are joining a classroom.'
      )
    ).toBeVisible();
  });
});
