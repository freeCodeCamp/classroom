import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Classes from '../../pages/classes/index';

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() }))
}));

const userSession = { user: { name: 'teacher', role: 'TEACHER' } };

const renderClasses = classrooms =>
  render(
    <SessionProvider session={userSession}>
      <Classes
        userSession={userSession}
        classrooms={classrooms}
        user='teacher-1'
        certificationNames={[]}
      />
    </SessionProvider>
  );

describe('Classes page', () => {
  it('shows the page title and how to manage classes', () => {
    renderClasses([]);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Your classes' })
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Create Class' })).toBeVisible();
  });

  it('guides a teacher with no classes yet', () => {
    renderClasses([]);

    expect(screen.getByText('No classes yet')).toBeVisible();
  });

  it('lists classes instead of the empty note', () => {
    renderClasses([
      {
        classroomName: 'Intro to Web Dev',
        classroomId: 'class-1',
        description: 'Fall semester',
        createdAt: JSON.stringify(new Date('2026-09-01')),
        fccCertifications: []
      }
    ]);

    expect(screen.getByText('Intro to Web Dev')).toBeVisible();
    expect(screen.queryByText('No classes yet')).not.toBeInTheDocument();
  });
});
