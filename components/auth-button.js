import { useSession, signIn, signOut } from 'next-auth/react';

export default function AuthButton() {
  const { data: session } = useSession();
  if (session) {
    return (
      <>
        <button
          onClick={() => signOut()}
          className='hover:bg-[#ffbf00] shadedow-lg border-solid border-color: inherit; border-[1px] pl-4 pr-4 bg-[#f1be32] text-black'
        >
          Sign out
        </button>
      </>
    );
  }
  return (
    <>
      <button
        onClick={() =>
          signIn(null, { callbackUrl: 'http://localhost:3000/classes' })
        }
        className='hover:bg-[#ffbf00] shadedow-lg border-solid border-color: inherit; border-[1px] pl-4 pr-4 bg-[#f1be32] text-black'
      >
        Sign In
      </button>
    </>
  );
}
