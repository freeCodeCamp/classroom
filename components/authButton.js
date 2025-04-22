import { useSession, signIn, signOut } from 'next-auth/react';

export default function AuthButton() {
  const { data: session } = useSession();
  if (session) {
    return (
      <>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className='hover:bg-[#ffbf00] shadow-lg border-solid border-color: inherit; border-[1px] pl-4 pr-4 bg-fcc-primary-yellow text-black'
        >
          Sign out
        </button>
      </>
    );
  }
  return (
    <>
      <button
        onClick={() => signIn(null)}
        className='hover:bg-[#ffbf00] shadow-lg border-solid border-color: inherit; border-[1px] pl-4 pr-4 bg-fcc-primary-yellow text-black'
      >
        Sign in
      </button>
    </>
  );
}
