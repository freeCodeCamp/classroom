import Head from 'next/head';
import { Button } from '@freecodecamp/ui';
import ButtonLink from '../../components/helpers/button-link';
import Navbar from '../../components/navbar';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';
import AuthButton from '../../components/authButton';
import DisplayNotification from '../../components/displayNotification';
import prisma from '../../prisma/prisma';

export async function getServerSideProps(ctx) {
  const userSession = await getSession(ctx);

  const params = ctx.params || {};
  const joinParam = params.joinCode || null;
  const classroomId = Array.isArray(joinParam) ? joinParam[0] : joinParam;

  let classroom = null;
  let userIsConnected = false;
  let userRole = null;
  if (classroomId) {
    try {
      classroom = await prisma.classroom.findUnique({
        where: { classroomId },
        select: {
          classroomName: true,
          description: true,
          classroomId: true,
          fccUserIds: true
        }
      });

      if (userSession?.user?.email && classroom) {
        const userInfo = await prisma.user.findUnique({
          where: {
            email: userSession.user.email
          },
          select: {
            id: true,
            role: true
          }
        });

        userIsConnected = Boolean(
          userInfo && classroom.fccUserIds.includes(userInfo.id)
        );
        userRole = userInfo?.role ?? null;
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
      userRole
    }
  };
}
export default function JoinWithCode({
  userSession,
  classroom,
  userIsConnected,
  userRole
}) {
  const router = useRouter();
  const { joinCode } = router.query;
  const classroomId = Array.isArray(joinCode) ? joinCode[0] : joinCode;
  const [isConnected, setIsConnected] = useState(Boolean(userIsConnected));

  const classroomRequest = async event => {
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

      if (!res.ok || !payload?.success) {
        DisplayNotification(
          'Error',
          payload?.message || 'Sorry, we could not connect your account.'
        );
      } else {
        setIsConnected(true);
        DisplayNotification('Success', 'Your FCC account is now connected.');
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
            <form className='mb-8' onSubmit={classroomRequest}>
              <Button
                type='submit'
                size='large'
                block
                disabled={isConnected}
                className={isConnected ? '' : 'btn-cta'}
              >
                Connect to Classroom
              </Button>
            </form>
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
            <ButtonLink
              href='https://www.freecodecamp.org/settings'
              target='_blank'
            >
              Open freeCodeCamp Settings
            </ButtonLink>
          </main>
        )}
      </div>
    </>
  );
}
