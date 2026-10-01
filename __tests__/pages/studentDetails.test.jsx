import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentDetails from '../../pages/dashboard/v2/details/[id]/[studentEmail]';

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() }))
}));

const userSession = { user: { name: 'teacher', role: 'TEACHER' } };

describe('Student details page', () => {
  it('shows an error instead of the dashboard when progress failed to load', () => {
    render(
      <SessionProvider session={userSession}>
        <StudentDetails
          userSession={userSession}
          studentEmail='student@example.org'
          superblocksDetailsJSONArray={[]}
          superblockTitles={[]}
          studentData={{ email: 'student@example.org', certifications: [] }}
          fetchError='FETCH_FAILED'
          classroomName='Period 3'
          classroomID='class-1'
        />
      </SessionProvider>
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      "We couldn't load this student's progress"
    );
    expect(screen.queryByText(/active days/)).not.toBeInTheDocument();
  });
});
