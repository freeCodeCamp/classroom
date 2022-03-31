import { useSession, signIn, signOut } from 'next-auth/react';
import loginStyles from './Login.module.css';

export default function AuthButton() {
  const { data: session } = useSession();
  if (session) {
    return (
      <>
        Signed in as {session.user.email} <br />{' '}
        <img src={session.user.image} witdth='250' height="250'"></img>
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }
  return (
    <>
      <div>
        <div className={loginStyles.box}>
          <button onClick={() => signIn()} className={loginStyles.cta_button}>
            Sign In
          </button>
        </div>
      </div>
    </>
  );
}
