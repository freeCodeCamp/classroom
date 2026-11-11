import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ClassroomDashboard from '../../pages/dashboard/v2/[id]';
import type { Session } from 'next-auth';

vi.mock('next/router', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn(), asPath: '/' }))
}));

const baseProps = {
  userSession: {
    user: { name: 'teacher', role: 'TEACHER' }
  } as unknown as Session,
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
  createdDate: 'September 2, 2026',
  joinMode: 'OPEN' as const,
  joinRequests: []
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
    const writeText = vi.fn<() => Promise<void>>().mockResolvedValue();
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

describe('Classroom dashboard roster management', () => {
  const studentData = [{ email: 'kid@example.com', certifications: [] }];

  // Headless UI's Dialog (used by @freecodecamp/ui's Modal) needs
  // ResizeObserver, which jsdom doesn't implement. Stubbed the same way as
  // the other modal tests.
  beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    };
  });

  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
  });

  it('asks for confirmation, then removes a student', async () => {
    renderPage({ studentData });

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Remove kid@example.com from the class'
      })
    );
    expect(screen.getByText('Remove student?')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Remove student' }));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/remove_student',
        expect.objectContaining({
          method: 'DELETE',
          body: JSON.stringify({
            classroomId: 'class-1',
            studentEmail: 'kid@example.com'
          })
        })
      )
    );
  });

  it('shows the join mode picker set to the current mode', () => {
    renderPage({ joinMode: 'CLOSED' });

    expect(screen.getByLabelText('Who can join')).toHaveValue('CLOSED');
  });

  it('hides join requests for an open class with none waiting', () => {
    renderPage();

    expect(screen.queryByText(/Join requests/)).toBeNull();
  });

  it('lists join requests and approves one', async () => {
    renderPage({
      joinMode: 'ASK_TO_JOIN',
      joinRequests: [{ userId: 'student-9', email: 'new@example.com' }]
    });

    expect(screen.getByText('Join requests (1)')).toBeVisible();
    fireEvent.click(
      screen.getByRole('button', { name: 'Approve new@example.com' })
    );

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/join_request',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            classroomId: 'class-1',
            userId: 'student-9',
            decision: 'approve'
          })
        })
      )
    );
  });
});
