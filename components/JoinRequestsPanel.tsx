import { useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Panel } from '@freecodecamp/ui';
import type React from 'react';
import DisplayNotification from './displayNotification';

export type JoinRequest = {
  userId: string;
  email: string;
};

type JoinRequestsPanelProps = {
  classroomId: string;
  requests: JoinRequest[];
};

type Decision = 'approve' | 'decline';

const GENERIC_ERROR =
  'Sorry, there was an error on our end. Please try again later.';

/**
 * Students waiting for the teacher's approval to join (classes in "Ask to
 * join" mode). Approving adds them to the roster; declining clears the
 * request.
 */
export default function JoinRequestsPanel({
  classroomId,
  requests
}: JoinRequestsPanelProps): React.JSX.Element {
  const router = useRouter();
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const respond = async (
    request: JoinRequest,
    decision: Decision
  ): Promise<void> => {
    setBusyUserId(request.userId);
    try {
      const res = await fetch('/api/join_request', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classroomId,
          userId: request.userId,
          decision
        })
      });
      if (res.ok) {
        DisplayNotification(
          'Success',
          decision === 'approve'
            ? `${request.email} joined the class`
            : `Declined ${request.email}`
        );
      } else if (res.status === 404) {
        DisplayNotification('Info', 'That request was already handled.');
      } else {
        DisplayNotification('Error', GENERIC_ERROR);
        return;
      }
      await router.replace(router.asPath, undefined, { scroll: false });
    } catch (error) {
      DisplayNotification('Error', GENERIC_ERROR);
      console.log(error);
    } finally {
      setBusyUserId(null);
    }
  };

  return (
    <Panel className='mb-8'>
      <Panel.Heading>
        <Panel.Title>Join requests ({requests.length})</Panel.Title>
      </Panel.Heading>
      <Panel.Body>
        {requests.length === 0 ? (
          <p className='m-0'>No one is waiting to join.</p>
        ) : (
          <ul className='m-0 p-0 list-none'>
            {requests.map(request => (
              <li
                key={request.userId}
                className='flex flex-wrap items-center gap-2 py-2'
              >
                <span className='flex-1 min-w-[200px] wrap-break-word'>
                  {request.email}
                </span>
                <Button
                  className='btn-cta'
                  disabled={busyUserId !== null}
                  onClick={() => void respond(request, 'approve')}
                  aria-label={`Approve ${request.email}`}
                >
                  Approve
                </Button>
                <Button
                  variant='danger'
                  disabled={busyUserId !== null}
                  onClick={() => void respond(request, 'decline')}
                  aria-label={`Decline ${request.email}`}
                >
                  Decline
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Panel.Body>
    </Panel>
  );
}
