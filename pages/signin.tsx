import { useEffect, useRef } from 'react';
import Head from 'next/head';
import { signIn } from 'next-auth/react';
import { Button } from '@freecodecamp/ui';
import Navbar from '../components/navbar';
import { safeCallbackPath } from '../util/safeCallbackPath';
import type React from 'react';
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

type SignInPageProps = {
  devLogin: boolean;
  callbackUrl: string;
  error: string | null;
};

const DEFAULT_EMAIL = 'teacher@classroom.local';

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<SignInPageProps>> {
  const devLogin =
    process.env.NODE_ENV !== 'production' &&
    process.env.FCC_ENABLE_DEV_LOGIN_MODE === 'true';
  const callbackUrl = safeCallbackPath(
    context.query.callbackUrl,
    process.env.NEXTAUTH_URL ?? 'http://localhost'
  );
  const { error } = context.query;

  return {
    props: {
      devLogin,
      callbackUrl,
      error: typeof error === 'string' ? error : null
    }
  };
}

export default function SignInPage({
  devLogin,
  callbackUrl,
  error
}: SignInPageProps): React.JSX.Element {
  const redirected = useRef(false);
  const shouldRedirect = !devLogin && error === null;

  useEffect(() => {
    if (shouldRedirect && !redirected.current) {
      redirected.current = true;
      void signIn('auth0', { callbackUrl });
    }
  }, [shouldRedirect, callbackUrl]);

  return (
    <>
      <Head>
        <title>Sign in | freeCodeCamp Classroom</title>
      </Head>
      <Navbar></Navbar>

      <main className='max-w-2xl mx-auto px-4 py-16 text-center'>
        {devLogin ? (
          <>
            <h1 className='big-heading'>Development sign in</h1>
            {error !== null && <p>{`Sign in did not complete (${error}).`}</p>}
            <form method='post' action='/api/auth/dev-login' className='mb-8'>
              <label htmlFor='email'>Email</label>
              <input
                type='email'
                name='email'
                id='email'
                defaultValue={DEFAULT_EMAIL}
                required
              />
              <input type='hidden' name='callbackUrl' value={callbackUrl} />
              <Button type='submit' size='large' block className='btn-cta'>
                Sign in
              </Button>
            </form>
            <ul>
              <li>
                Seeded users: admin@classroom.local, teacher@classroom.local,
                student@classroom.local
              </li>
            </ul>
          </>
        ) : error !== null ? (
          <>
            <h1 className='big-heading'>Sign in failed</h1>
            <p>{`Sign in did not complete (${error}). Try again.`}</p>
            <Button
              type='button'
              size='large'
              className='btn-cta'
              onClick={() => {
                void signIn('auth0', { callbackUrl });
              }}
            >
              Try again
            </Button>
          </>
        ) : (
          <p>Redirecting to sign in…</p>
        )}
      </main>
    </>
  );
}
