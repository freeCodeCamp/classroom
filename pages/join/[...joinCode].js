// pages/join/[...joinCode].js
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export async function getServerSideProps(ctx) {
  const session = await getSession(ctx); // renamed to avoid 'unused variable' warning

  if (!session) {
    // redirect if not logged in
    return {
      redirect: {
        destination: '/error',
        permanent: false
      }
    };
  }

  return {
    props: {
      userSession: session
    }
  };
}

export default function JoinWithCode() {
  const router = useRouter();
  const { joinCode } = router.query;
  const [status, setStatus] = useState('Joining...');

  useEffect(() => {
    if (!joinCode) return;

    async function joinClassroom() {
      try {
        const res = await fetch('/api/student_email_join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            classroomId: joinCode // invite code is classroomId
          })
        });

        const data = await res.json();

        if (res.ok) {
          setStatus('✅ You have successfully joined the classroom!');
          // redirect student to dashboard after 2s
          setTimeout(() => {
            router.push(`/dashboard/${joinCode}`);
          }, 2000);
        } else {
          setStatus(`❌ Error: ${data.error}`);
        }
      } catch (err) {
        console.error('Join error:', err);
        setStatus('❌ Something went wrong while joining.');
      }
    }

    joinClassroom();
  }, [joinCode, router]);

  return (
    <div className='flex flex-col items-center justify-center min-h-screen'>
      <h1 className='text-2xl font-bold'>Classroom Join</h1>
      <p className='mt-4'>{status}</p>
    </div>
  );
}
