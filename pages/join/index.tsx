import Layout from '../../components/layout';
import Head from 'next/head';
import Navbar from '../../components/navbar';
import ButtonLink from '../../components/helpers/button-link';
import AuthButton from '../../components/authButton';
import { getSession } from 'next-auth/react';
import type React from 'react';
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import type { Session } from 'next-auth';

type JoinProps = {
  userSession: Session | null;
};

export default function Join({ userSession }: JoinProps): React.JSX.Element {
  return (
    <Layout>
      <Head>
        <title>Join a Classroom | freeCodeCamp Classroom</title>
        <meta name='description' content='Join a freeCodeCamp Classroom' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Navbar hideAuthButton={!userSession} />

      <main className='max-w-2xl mx-auto px-4 py-16 text-center'>
        {!userSession ? (
          <>
            <h1 className='big-heading'>Sign in with freeCodeCamp</h1>
            <p>Sign in to join your teacher&apos;s classroom.</p>
            <AuthButton size='large' />
          </>
        ) : (
          <>
            <h1 className='big-heading'>No join code provided</h1>
            <p>
              To join a Classroom, you must open the unique join link provided
              by your instructor. The link should look like{' '}
              <code>/join/&lt;classroomId&gt;</code>.
            </p>
            <ButtonLink href='/'>Return to Home</ButtonLink>
          </>
        )}
      </main>
    </Layout>
  );
}

export async function getServerSideProps(
  ctx: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<JoinProps>> {
  const session = await getSession(ctx);
  return {
    props: {
      userSession: session || null
    }
  };
}
