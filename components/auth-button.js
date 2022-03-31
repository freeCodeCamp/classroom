import { useSession, signIn, signOut } from 'next-auth/react';
import loginStyles from './Login.module.css';

export default function AuthButton() {
  const { data: session } = useSession();
  if (session) {
    return (
      <>
        <div className={loginStyles.box}>
          Signed in as {session.user.email} <br />{' '}
          <button onClick={() => signOut()} className={loginStyles.cta_button}>
            Sign out
          </button>
        </div>
      </>
    );
  }
  return (
    <>
      <div>
        <div className={loginStyles.box}>
          <button
            onClick={() =>
              signIn(null, { callbackUrl: 'http://localhost:3000/dashboard' })
            }
            className={loginStyles.cta_button}
          >
            Sign In
          </button>
        </div>
      </div>
    </>
  );
}
