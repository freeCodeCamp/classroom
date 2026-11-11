import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import JoinWithCode from '../../pages/join/[...joinCode]';
import type { Session } from 'next-auth';
import type { JoinMode } from '../../util/joinModes';

vi.mock('next/router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    query: { joinCode: ['class-1'] },
    asPath: '/join/class-1'
  }))
}));

const studentSession = {
  user: { name: 'kid', role: 'STUDENT' },
  expires: '2099-01-01T00:00:00.000Z'
} as unknown as Session;

const renderJoin = ({
  signedIn = true,
  joinMode = 'OPEN',
  userIsConnected = false,
  userIsPending = false
}: {
  signedIn?: boolean;
  joinMode?: JoinMode;
  userIsConnected?: boolean;
  userIsPending?: boolean;
} = {}) => {
  const session = signedIn ? studentSession : null;
  return render(
    <SessionProvider session={session}>
      <JoinWithCode
        userSession={session}
        classroom={{
          classroomName: 'Period 3',
          description: null,
          classroomId: 'class-1',
          joinMode
        }}
        userIsConnected={userIsConnected}
        userIsPending={userIsPending}
        userRole={signedIn ? 'STUDENT' : null}
      />
    </SessionProvider>
  );
};

describe('Join page', () => {
  it('asks a signed-out visitor to sign in even when the class is closed', () => {
    renderJoin({ signedIn: false, joinMode: 'CLOSED' });

    expect(
      screen.getByRole('heading', { name: 'Sign in with freeCodeCamp' })
    ).toBeVisible();
    expect(screen.queryByText('Class Closed')).toBeNull();
  });

  it('tells a signed-in new student that a closed class is closed', () => {
    renderJoin({ joinMode: 'CLOSED' });

    expect(screen.getByRole('heading', { name: 'Class Closed' })).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Connect to Classroom' })
    ).toBeNull();
  });

  it('shows a member of a closed class that they are connected', () => {
    renderJoin({ joinMode: 'CLOSED', userIsConnected: true });

    expect(screen.queryByText('Class Closed')).toBeNull();
    expect(screen.getByText(/You're connected to/)).toBeVisible();
  });

  it('shows a pending student that their request was sent', () => {
    renderJoin({ joinMode: 'ASK_TO_JOIN', userIsPending: true });

    expect(screen.getByText(/Request sent/)).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Connect to Classroom' })
      // @freecodecamp/ui's Button marks itself disabled with aria-disabled.
    ).toHaveAttribute('aria-disabled', 'true');
  });

  it('lets a student join an Open class', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, status: 'JOINED' })
    });
    renderJoin();

    fireEvent.click(
      screen.getByRole('button', { name: 'Connect to Classroom' })
    );

    await waitFor(() =>
      expect(screen.getByText(/You're connected to/)).toBeVisible()
    );
    expect(screen.queryByText(/Request sent/)).toBeNull();
  });
});
