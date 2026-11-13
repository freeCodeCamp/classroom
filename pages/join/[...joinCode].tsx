import Head from 'next/head';
import { Button } from '@freecodecamp/ui';
import ButtonLink from '../../components/helpers/button-link';
import Navbar from '../../components/navbar';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { getSessionUser } from '../../util/pageAuth';
import AuthButton from '../../components/authButton';
import DisplayNotification from '../../components/displayNotification';
import prisma from '../../prisma/prisma';
import type React from 'react';
import type { ParsedUrlQuery } from 'querystring';
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import type { Session } from 'next-auth';
import type { Classroom, User } from '../../generated/prisma/client';
import { JoinMode } from '../../util/joinModes';
import { getFccSiteUrl } from '../../util/fccSiteUrl';

type JoinClassroom = Pick<
  Classroom,
  'classroomName' | 'description' | 'classroomId' | 'joinMode'
>;

type JoinWithCodeProps = {
  userSession: Session | null;
  classroom: JoinClassroom | null;
  userIsConnected: boolean;
  userIsPending: boolean;
  userRole: User['role'] | null;
  fccSiteUrl: string;
};

export async function getServerSideProps(
  ctx: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<JoinWithCodeProps>> {
  // Signed-out users still see the page, with a sign-in button.
  const sessionUser = await getSessionUser(ctx);
  const userSession = sessionUser?.session ?? null;
  const user = sessionUser?.user ?? null;

  const params: ParsedUrlQuery = ctx.params || {};
  const joinParam = params.joinCode || null;
  const classroomId = Array.isArray(joinParam) ? joinParam[0] : joinParam;

  let classroom: JoinClassroom | null = null;
  let userIsConnected = false;
  let userIsPending = false;
  let userRole: User['role'] | null = null;
  if (classroomId) {
    try {
      const found = await prisma.classroom.findUnique({
        where: { classroomId },
        select: {
          classroomName: true,
          description: true,
          classroomId: true,
          joinMode: true,
          fccUserIds: true,
          pendingUserIds: true
        }
      });
      const fccUserIds = found?.fccUserIds ?? [];
      const pendingUserIds = found?.pendingUserIds ?? [];
      classroom = found
        ? {
            classroomName: found.classroomName,
            description: found.description,
            classroomId: found.classroomId,
            joinMode: found.joinMode
          }
        : null;

      if (user && classroom) {
        userIsConnected = fccUserIds.includes(user.id);
        // A request left over from "Ask to join" mode doesn't count once the
        // class is Open: the student can connect and join directly.
        userIsPending =
          !userIsConnected &&
          found?.joinMode !== JoinMode.OPEN &&
          pendingUserIds.includes(user.id);
        userRole = user.role;
      }
    } catch (err) {
      classroom = null;
    }
  }

  return {
    props: {
      userSession: userSession,
      classroom,
      userIsConnected,
      userIsPending,
      userRole,
      fccSiteUrl: getFccSiteUrl()
    }
  };
}
export default function JoinWithCode({
  userSession,
  classroom,
  userIsConnected,
  userIsPending,
  userRole,
  fccSiteUrl
}: JoinWithCodeProps): React.JSX.Element {
  const router = useRouter();
  const { joinCode } = router.query;
  const classroomId = Array.isArray(joinCode) ? joinCode[0] : joinCode;
  const [isConnected, setIsConnected] = useState(Boolean(userIsConnected));
  const [isPending, setIsPending] = useState(Boolean(userIsPending));
  const [isClosed, setIsClosed] = useState(
    classroom?.joinMode === JoinMode.CLOSED &&
      !userIsConnected &&
      !userIsPending
  );
  const needsApproval = classroom?.joinMode !== JoinMode.OPEN;

  const classroomRequest = async (
    event: React.SubmitEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    if (!classroomId) {
      DisplayNotification('Error', 'No classroom link was provided.');
      return;
    }

    try {
      const res = await fetch(`/api/student_email_join`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ classroomId })
      });

      const payload = await res.json().catch(() => null);

      if (payload?.error === 'CLASSROOM_CLOSED') {
        // The teacher closed the class after this page loaded.
        setIsClosed(true);
      } else if (!res.ok || !payload?.success) {
        DisplayNotification(
          'Error',
          payload?.message || 'Sorry, we could not connect your account.'
        );
      } else if (payload.status === 'PENDING') {
        setIsPending(true);
        DisplayNotification(
          'Success',
          'Request sent. Your teacher needs to approve it.'
        );
      } else {
        setIsConnected(true);
        DisplayNotification(
          'Success',
          'Your freeCodeCamp account is now connected.'
        );
      }
    } catch (error) {
      DisplayNotification(
        'Error',
        'Sorry, there was an error on our end. Please try again later.'
      );
      console.log(error);
    }
  };

  return (
    <>
      <div>
        <Head>
          <title>Join a Classroom | freeCodeCamp Classroom</title>
          <meta name='description' content='Join a freeCodeCamp Classroom' />
          <link rel='icon' href='/favicon.ico' />
        </Head>
        <Navbar hideAuthButton={!userSession} />
        {!userSession ? (
          <main className='max-w-2xl mx-auto px-4 py-16 text-center'>
            <h1 className='big-heading'>Sign in with freeCodeCamp</h1>
            <p>Sign in to join your teacher&apos;s classroom.</p>
            <AuthButton size='large' callbackUrl={router.asPath} />
          </main>
        ) : classroom === null ? (
          <main className='max-w-2xl mx-auto px-4 py-16 text-center'>
            <h1 className='big-heading'>Classroom Not Found</h1>
            <p>
              We could not find a classroom for this invite link. Please check
              the link or ask your teacher to resend the invite.
            </p>
            <ButtonLink href='/'>Back to Home</ButtonLink>
          </main>
        ) : isClosed ? (
          // Checked after sign-in: students already in the class, or with a
          // request from before it closed, still see their own status.
          <main className='max-w-2xl mx-auto px-4 py-16 text-center'>
            <h1 className='big-heading'>Class Closed</h1>
            <p>
              This class isn&apos;t accepting new students. If you think this is
              a mistake, ask your teacher.
            </p>
            <ButtonLink href='/'>Back to Home</ButtonLink>
          </main>
        ) : (
          <main className='max-w-2xl mx-auto px-4 py-16 text-center'>
            <h1 className='big-heading'>
              {userRole === 'TEACHER' || userRole === 'ADMIN'
                ? 'Join Classroom (as a Student)'
                : 'Join Classroom'}
            </h1>
            {classroom && (
              <p>
                Joining: <strong>{classroom.classroomName}</strong>
              </p>
            )}
            {needsApproval && !isConnected && !isPending && (
              <p>
                Your teacher needs to approve your request before you join this
                class.
              </p>
            )}
            <form className='mb-8' onSubmit={classroomRequest}>
              <Button
                type='submit'
                size='large'
                block
                disabled={isConnected || isPending}
                className={isConnected || isPending ? '' : 'btn-cta'}
              >
                Connect to Classroom
              </Button>
            </form>
            {isPending && (
              <p>
                Request sent. Your teacher needs to approve it before you join{' '}
                <strong>{classroom.classroomName}</strong>. Check back later.
              </p>
            )}
            {isConnected && (
              <p>
                You&apos;re connected to{' '}
                <strong>{classroom.classroomName}</strong>!
              </p>
            )}
            <p>
              If you have not enabled Classroom access on freeCodeCamp, please
              open your settings and enable it before connecting.
            </p>
            <ButtonLink href={`${fccSiteUrl}/settings`} target='_blank'>
              Open freeCodeCamp Settings
            </ButtonLink>
          </main>
        )}
      </div>
    </>
  );
}
