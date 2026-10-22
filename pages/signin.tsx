import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { signIn } from 'next-auth/react';
import { Button, ControlLabel, FormControl, FormGroup } from '@freecodecamp/ui';
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
const SEED_ACCOUNTS = [
  {
    role: 'Admin',
    email: 'admin@classroom.local',
    description: 'Manage users and teacher invitations.'
  },
  {
    role: 'Teacher',
    email: DEFAULT_EMAIL,
    description: 'Create classes and review student progress.'
  },
  {
    role: 'Student',
    email: 'student@classroom.local',
    description: 'Join a class and explore the student view.'
  }
];

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
  const [email, setEmail] = useState(DEFAULT_EMAIL);
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

      <main
        className={`mx-auto px-4 py-12 sm:py-16 ${devLogin ? 'max-w-3xl' : 'max-w-2xl text-center'}`}
      >
        {devLogin ? (
          <>
            <p className='mb-3 font-mono text-foreground-secondary'>
              Local development only
            </p>
            <h1 className='big-heading'>Development sign in</h1>
            <p className='mb-8 max-w-xl'>
              Explore Classroom with a local account. Choose a seeded user or
              enter an email below. No Auth0 account is needed.
            </p>
            {error !== null && (
              <p role='alert'>{`Sign in did not complete (${error}).`}</p>
            )}
            <form
              method='post'
              action='/api/auth/dev-login'
              className='border-1 border-background-quaternary bg-background-secondary p-5 sm:p-8'
            >
              <fieldset className='mb-8 min-w-0'>
                <legend className='mb-4 font-bold'>Choose a seeded user</legend>
                <div className='grid gap-3 sm:grid-cols-3'>
                  {SEED_ACCOUNTS.map(account => (
                    <label
                      key={account.email}
                      className={`flex cursor-pointer items-start gap-3 border-1 p-4 hover:border-foreground-primary focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-focus-outline-color ${email.toLowerCase() === account.email ? 'border-foreground-primary bg-background-primary' : 'border-background-quaternary'}`}
                    >
                      <input
                        type='radio'
                        name='seededUser'
                        value={account.email}
                        checked={email.toLowerCase() === account.email}
                        onChange={() => setEmail(account.email)}
                        aria-label={account.role}
                        aria-describedby={`seed-${account.role}`}
                        className='mt-1 shrink-0'
                      />
                      <span>
                        <span className='mb-2 block font-bold'>
                          {account.role}
                        </span>
                        <span
                          id={`seed-${account.role}`}
                          className='block text-foreground-secondary'
                        >
                          {account.description}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <FormGroup controlId='email'>
                <ControlLabel className='mb-2 block'>Email</ControlLabel>
                <FormControl
                  type='email'
                  name='email'
                  value={email}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(event.target.value)
                  }
                  aria-describedby='email-help'
                  required
                />
              </FormGroup>
              <p
                id='email-help'
                className='mt-3 mb-6 text-foreground-secondary'
              >
                A new email creates a local user with no role.
              </p>
              <input type='hidden' name='callbackUrl' value={callbackUrl} />
              <Button type='submit' size='large' block className='btn-cta'>
                Sign in
              </Button>
            </form>
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
