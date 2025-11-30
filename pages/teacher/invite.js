// pages/teacher/invite.js
import Head from 'next/head';
import Navbar from '../../components/navbar';
import { getServerAuthSession } from '../../lib/auth';
import { useState } from 'react';

export async function getServerSideProps(ctx) {
  const session = await getServerAuthSession(ctx.req, ctx.res);
  if (!session?.user)
    return { redirect: { destination: '/access-denied', permanent: false } };
  return { props: { session } };
}

export default function TeacherInvite({ session }) {
  const [email, setEmail] = useState('');
  const [classId, setClassId] = useState('');
  const [msg, setMsg] = useState('');

  async function handleInvite(e) {
    e.preventDefault();
    const res = await fetch('/api/invite_student_by_email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classroomId: Number(classId), email })
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg('Error: ' + (j.error || res.status));
      return;
    }
    setMsg('Invite sent: ' + (j.message || ''));
  }

  return (
    <>
      <Head>
        <title>Invite</title>
      </Head>
      <Navbar session={session} />
      <main style={{ padding: 24 }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2>Invite students</h2>
          <form onSubmit={handleInvite}>
            <div style={{ marginBottom: 12 }}>
              <label>Classroom ID</label>
              <br />
              <input
                value={classId}
                onChange={e => setClassId(e.target.value)}
                style={{ width: '100%', padding: 8 }}
                required
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Student email</label>
              <br />
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', padding: 8 }}
                required
              />
            </div>
            <button type='submit'>Invite</button>
          </form>
          {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
        </div>
      </main>
    </>
  );
}
