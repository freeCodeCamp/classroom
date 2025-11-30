// pages/join.js — Auto-join page (ESLint compliant, no logic changes)
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';

export default function JoinPage() {
  const router = useRouter();
  const { classroomId } = router.query;
  const { status } = useSession(); // removed unused "session"
  const [statusText, setStatusText] = useState('Waiting...');

  // Auto-join when router and classroomId are ready
  useEffect(() => {
    if (!router.isReady) return;

    if (!classroomId) {
      setStatusText('Missing classroomId in URL.');
      return;
    }

    // Not signed in → redirect to sign in
    if (status === 'unauthenticated') {
      const callback = `${window.location.pathname}${window.location.search}`;
      signIn(undefined, { callbackUrl: callback });
      return;
    }

    if (status === 'loading') {
      setStatusText('Checking sign-in...');
      return;
    }

    // Signed in → try joining
    if (status === 'authenticated') {
      (async () => {
        setStatusText('Joining class...');
        try {
          const res = await fetch('/api/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ classroomId })
          });

          const json = await res.json().catch(() => ({}));

          if (!res.ok) {
            setStatusText('Join failed: ' + (json.error || res.status));
            return;
          }

          setStatusText('Joined! Redirecting to your student dashboard...');

          // small pause before redirect
          setTimeout(() => router.push('/student'), 800);
        } catch (err) {
          console.error('Join error:', err);
          setStatusText('Network error while joining.');
        }
      })();
    }
  }, [router, router.isReady, classroomId, status]); // added router to deps

  return (
    <main style={{ padding: 24 }}>
      <h1>Join Class</h1>
      <p>Classroom ID: {String(classroomId || '')}</p>
      <div>Status: {statusText}</div>

      <div style={{ marginTop: 12 }}>
        If nothing happens, ensure you&apos;re signed in as a student and
        refresh.
        {/* Fixed unescaped apostrophe */}
      </div>
    </main>
  );
}
