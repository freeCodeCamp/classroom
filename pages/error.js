import Head from 'next/head';
import Navbar from '../components/navbar';
import ButtonLink from '../components/helpers/button-link';
import { getSession } from 'next-auth/react';

const getGuidance = ({ hasSession, hasUser, role, inviteStatus, reason }) => {
  if (!hasSession) {
    return {
      heading: 'Please Sign In',
      body: 'You must sign in before accessing protected pages.',
      actionLabel: 'Go to Home',
      actionHref: '/'
    };
  }

  if (!hasUser) {
    return {
      heading: 'Account Not Found',
      body: 'Your account could not be located. Please contact your administrator.',
      actionLabel: 'Go to Home',
      actionHref: '/'
    };
  }

  if (role === 'ADMIN') {
    return {
      heading: 'Admin Access Route',
      body: 'Your account is an admin account. Use the admin dashboard to manage access and invitations.',
      actionLabel: 'Open Admin Dashboard',
      actionHref: '/admin'
    };
  }

  if (role === 'TEACHER') {
    return {
      heading: 'Teacher Access Route',
      body: 'Your account is a teacher account. Continue from your classes page.',
      actionLabel: 'Open Classes',
      actionHref: '/classes'
    };
  }

  if (role === 'STUDENT') {
    return {
      heading: 'Student Access',
      body: 'This area is reserved for teachers and admins. Ask your teacher for the student join link or class code.',
      actionLabel: 'Go to Home',
      actionHref: '/'
    };
  }

  if (inviteStatus === 'PENDING') {
    return {
      heading: 'Teacher Invitation Found',
      body: 'A teacher invitation exists for your email. Ask your administrator to share or resend your invite link so you can accept it.',
      actionLabel: 'Go to Home',
      actionHref: '/'
    };
  }

  if (inviteStatus === 'EXPIRED') {
    return {
      heading: 'Teacher Invitation Expired',
      body: 'Your teacher invitation has expired. Ask your administrator to resend a new invitation.',
      actionLabel: 'Go to Home',
      actionHref: '/'
    };
  }

  if (inviteStatus === 'REVOKED') {
    return {
      heading: 'Teacher Invitation Revoked',
      body: 'Your previous teacher invitation was revoked. Contact your administrator if this needs to be restored.',
      actionLabel: 'Go to Home',
      actionHref: '/'
    };
  }

  if (reason === 'role-required') {
    return {
      heading: 'Role Required',
      body: 'Your account does not currently have the required role for this page. Contact your administrator for access.',
      actionLabel: 'Go to Home',
      actionHref: '/'
    };
  }

  return {
    heading: 'Access Denied',
    body: 'Please contact your administrator if you believe this is incorrect.',
    actionLabel: 'Go to Home',
    actionHref: '/'
  };
};

export async function getServerSideProps(ctx) {
  // Dynamic import to prevent Prisma from being bundled for client
  const { default: prisma } = await import('../prisma/prisma');

  const userSession = await getSession(ctx);
  const reason = ctx?.query?.reason || null;

  if (!userSession?.user?.email) {
    return {
      props: {
        hasSession: false,
        hasUser: false,
        role: null,
        inviteStatus: null,
        reason
      }
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      email: userSession.user.email
    },
    select: {
      role: true,
      email: true
    }
  });

  if (!user?.email) {
    return {
      props: {
        hasSession: true,
        hasUser: false,
        role: null,
        inviteStatus: null,
        reason
      }
    };
  }

  const latestInvite = await prisma.teacherInvitation.findFirst({
    where: {
      invitedTeacherEmail: {
        equals: user.email,
        mode: 'insensitive'
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      status: true
    }
  });

  return {
    props: {
      hasSession: true,
      hasUser: true,
      role: user.role,
      inviteStatus: latestInvite?.status || null,
      reason
    }
  };
}

export default function ErrorPage(props) {
  const guidance = getGuidance(props);

  return (
    <>
      <Head>
        <title>{`${guidance.heading} | freeCodeCamp Classroom`}</title>
      </Head>
      <Navbar></Navbar>

      <main className='max-w-2xl mx-auto px-4 py-16 text-center'>
        <h1 className='big-heading'>{guidance.heading}</h1>
        <p>{guidance.body}</p>
        <ButtonLink className='btn-cta' href={guidance.actionHref}>
          {guidance.actionLabel}
        </ButtonLink>
      </main>
    </>
  );
}
