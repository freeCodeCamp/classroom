import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClassroomDashboard from '../../pages/dashboard/v2/[id]';

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() }))
}));

const baseProps = {
  userSession: { user: { name: 'teacher', role: 'TEACHER' } },
  classroomId: 'class-1',
  totalChallenges: 10,
  studentData: [],
  studentsAreEnrolledInSuperblocks: [],
  fetchError: null,
  isEmpty: false,
  joinLink: 'http://localhost:3001/join/class-1',
  classroomName: 'Intro to Web Dev, Period 3',
  description: 'Fall semester web development.',
  certificationTitles: ['Responsive Web Design', 'JavaScript'],
  studentCount: 12,
  createdDate: 'September 2, 2026'
};

const renderPage = (props = {}) =>
  render(
    <SessionProvider session={baseProps.userSession}>
      <ClassroomDashboard {...baseProps} {...props} />
    </SessionProvider>
  );

describe('Classroom dashboard header', () => {
  it('shows the class name, description, summary and certifications', () => {
    renderPage();

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Intro to Web Dev, Period 3'
      })
    ).toBeVisible();
    expect(screen.getByText('Fall semester web development.')).toBeVisible();
    expect(
      screen.getByText('12 students · Created September 2, 2026')
    ).toBeVisible();
    expect(
      screen
        .getByRole('region', { name: 'Certifications' })
        .querySelectorAll('li')
    ).toHaveLength(2);
  });

  it('copies the invite link', async () => {
    const writeText = jest.fn().mockResolvedValue();
    Object.assign(navigator, { clipboard: { writeText } });
    renderPage();

    expect(
      screen.getByLabelText(/share this link with your students/i)
    ).toHaveValue('http://localhost:3001/join/class-1');
    fireEvent.click(screen.getByRole('button', { name: 'Copy invite link' }));

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(
        'http://localhost:3001/join/class-1'
      )
    );
  });
});

describe('Classroom dashboard student states', () => {
  it('explains how students join when the class is empty', () => {
    renderPage({ isEmpty: true, studentCount: 0 });

    expect(screen.getByText('No students yet')).toBeVisible();
    expect(
      screen.getByText('0 students · Created September 2, 2026')
    ).toBeVisible();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows an error when students could not be loaded', () => {
    renderPage({ fetchError: 'FETCH_FAILED' });

    expect(screen.getByRole('alert')).toHaveTextContent(
      "We couldn't load your students"
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows the student table otherwise', () => {
    renderPage();

    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
