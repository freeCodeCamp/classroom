import Head from 'next/head';
import { getSession } from 'next-auth/react';
import {
  Callout,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@freecodecamp/ui';
import Navbar from '../components/navbar';
import AuthButton from '../components/authButton';
import Link from '../components/helpers/link';
import { StudentGuide, TeacherGuide } from '../components/OnboardingGuides';

const ROLE_LABELS = {
  ADMIN: 'an Admin',
  TEACHER: 'a Teacher',
  STUDENT: 'a Student'
};

export async function getServerSideProps(ctx) {
  const session = await getSession(ctx);
  return {
    props: {
      isSignedIn: Boolean(session),
      role: session?.user?.role ?? null
    }
  };
}

export default function Home({ isSignedIn, role }) {
  const roleLabel = ROLE_LABELS[role];

  return (
    <>
      <Head>
        <title>freeCodeCamp Classroom</title>
        <meta
          name='description'
          content='Plan and manage classroom-based learning on top of the freeCodeCamp curriculum.'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Navbar />

      <main className='max-w-3xl mx-auto px-4 py-12'>
        <div className='text-center mb-8'>
          <h1 className='big-heading'>freeCodeCamp Classroom</h1>
          <p>
            Plan and manage classroom-based learning on top of the freeCodeCamp
            curriculum.
          </p>
          {!isSignedIn ? (
            <AuthButton size='large' />
          ) : roleLabel ? (
            <p>
              You&apos;re signed in as <strong>{roleLabel}</strong>.
            </p>
          ) : (
            <p>
              You&apos;re signed in, but your account doesn&apos;t have a role
              yet. Follow the steps below to get started.
            </p>
          )}
        </div>

        {role === 'ADMIN' && (
          <Callout variant='note' label='Managing Classroom'>
            <p className='mb-0'>
              Invite teachers and manage user roles from the{' '}
              <Link to='/admin'>admin dashboard</Link>.
            </p>
          </Callout>
        )}

        {role === 'STUDENT' ? (
          <StudentGuide />
        ) : (
          <Tabs defaultValue='teachers'>
            <TabsList aria-label='Getting started guides'>
              <TabsTrigger value='teachers'>For teachers</TabsTrigger>
              <TabsTrigger value='students'>For students</TabsTrigger>
            </TabsList>
            <TabsContent value='teachers' className='pt-6'>
              <TeacherGuide isTeacher={role === 'TEACHER'} />
            </TabsContent>
            <TabsContent value='students' className='pt-6'>
              <StudentGuide />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </>
  );
}
