import { useSession, signIn, signOut } from 'next-auth/react';

export default function TeacherAuthButton() {
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
        onClick={() => signIn(null)}
        className='hover:bg-[#ffbf00] shadedow-lg border-solid border-color: inherit; border-[1px] pl-4 pr-4 bg-[#f1be32] text-black'
      >
        Teacher Sign in
      </button>
    </>
  );
}
