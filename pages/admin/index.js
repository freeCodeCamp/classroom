import Head from 'next/head';
import { Button, HeadlessDisclosure } from '@freecodecamp/ui';
import Navbar from '../../components/navbar';
import { getSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import redirectUser from '../../util/redirectUser.js';
import TeacherInvitesPanel from '../../components/TeacherInvitesPanel';
import { isTeacherInvitesEnabled } from '../../util/featureFlags';

export async function getServerSideProps(ctx) {
  // Dynamic import to prevent Prisma from being bundled for client
  const { default: prisma } = await import('../../prisma/prisma');

  const userSession = await getSession(ctx);
  if (!userSession) {
    return redirectUser('/error');
  }

  const user = await prisma.User.findUnique({
    where: {
      email: userSession['user']['email']
    },
    select: {
      email: true,
      role: true
    }
  });

  if (user.role != 'ADMIN') {
    return redirectUser('/error');
  }

  const users = await prisma.User.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  });
  return {
    props: {
      userSession,
      users: users,
      teacherInvitesEnabled: isTeacherInvitesEnabled()
    }
  };
}

export default function Home(props) {
  const AdminTable = dynamic(() => import('../../components/adminTable'), {
    ssr: false
  });
  const columns = [
    {
      name: 'Name',
      selector: row => row.name
    },
    {
      name: 'Email',
      selector: row => row.userEmail
    },
    {
      name: 'Role',
      selector: row => row.role
    },
    {
      name: 'Actions',
      selector: row => row.adminActions
    }
  ];
  return (
    <>
      <Head>
        <title>Admin dashboard | freeCodeCamp Classroom</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Navbar />
      <main className='max-w-5xl mx-auto px-4 py-10'>
        <h1 className='big-heading'>Admin dashboard</h1>
        {props.teacherInvitesEnabled && (
          <>
            <HeadlessDisclosure as='section' defaultOpen className='mt-6'>
              {({ open }) => (
                <>
                  <div className='flex flex-wrap items-center justify-between gap-4'>
                    <h2 className='m-0'>Teacher Invitations</h2>
                    <HeadlessDisclosure.Button as={Button} size='small'>
                      {open ? 'Hide' : 'Show'}
                    </HeadlessDisclosure.Button>
                  </div>
                  <p className='text-foreground-quaternary'>
                    Invite management and invitation history.
                  </p>
                  <HeadlessDisclosure.Panel>
                    <TeacherInvitesPanel />
                  </HeadlessDisclosure.Panel>
                </>
              )}
            </HeadlessDisclosure>

            <hr />
          </>
        )}

        <HeadlessDisclosure defaultOpen>
          {({ open }) => (
            <>
              <section className='mt-6'>
                <div className='flex flex-wrap items-center justify-between gap-4'>
                  <h2 className='m-0'>User Database</h2>
                  <HeadlessDisclosure.Button as={Button} size='small'>
                    {open ? 'Hide' : 'Show'}
                  </HeadlessDisclosure.Button>
                </div>
                <p className='text-foreground-quaternary'>
                  Current users and role management actions.
                </p>
              </section>
              <HeadlessDisclosure.Panel className='overflow-x-auto'>
                <AdminTable columns={columns} data={props.users}></AdminTable>
              </HeadlessDisclosure.Panel>
            </>
          )}
        </HeadlessDisclosure>
      </main>
    </>
  );
}
