import Layout from '../../components/layout';
import Head from 'next/head';
import Navbar from '../../components/navbar';
import Link from 'next/link';
import AuthButton from '../../components/authButton';
import { getSession } from 'next-auth/react';

export default function Join({ userSession }) {
  return (
    <Layout>
      <Head>
        <title>Join a Classroom</title>
        <meta name='description' content='Join a freeCodeCamp Classroom' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Navbar hideAuthButton={!userSession} />

      <div className='pt-28 px-4 sm:px-6 lg:px-8 overflow-hidden'>
        <div className='max-w-lg mx-auto w-full text-center'>
          {!userSession ? (
            <div className='space-y-6'>
              <div className='space-y-4'>
                <h2 className='text-2xl font-extrabold'>
                  Sign In with FreeCodeCamp
                </h2>
                <div className='flex items-center justify-center'>
                  <AuthButton />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h1 className='text-2xl font-bold mb-4'>No join code provided</h1>
              <p className='mb-4'>
                To join a Classroom, you must open the unique join link provided
                by your instructor. The link should look like{' '}
                <code>/join/&lt;classroomId&gt;</code>.
              </p>
              <Link href='/' legacyBehavior>
                <a className='inline-block px-4 py-2 bg-fcc-gray-90 text-white rounded'>
                  Return to Home
                </a>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(ctx) {
  const session = await getSession(ctx);
  return {
    props: {
      userSession: session || null
    }
  };
}
