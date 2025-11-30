// pages/teacher/create.js
import Head from 'next/head';
import Navbar from '../../components/navbar';
import { getServerAuthSession } from '../../lib/auth';
import { useState } from 'react';

export async function getServerSideProps(ctx) {
  const session = await getServerAuthSession(ctx.req, ctx.res);
  if (!session || !session.user)
    return { redirect: { destination: '/access-denied', permanent: false } };
  const role = (session.user.role || '').toLowerCase();
  if (!['teacher', 'admin'].includes(role))
    return { redirect: { destination: '/access-denied', permanent: false } };
  const safeSession = {
    ...session,
    user: { ...session.user, id: Number(session.user.id) }
  };
  return { props: { session: safeSession } };
}

export default function TeacherCreate({ session: initialSession }) {
  const [session] = useState(initialSession || null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    setLoading(true);
    if (!session?.user?.id) {
      setLoading(false);
      alert('Session missing — please sign in again.');
      return;
    }

    const payload = {
      classroomName: name,
      description: desc,
      classroomTeacherId: Number(session.user.id)
    };

    try {
      const res = await fetch('/api/create_class_teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLoading(false);
        alert('Error: ' + (json.error || res.status));
        return;
      }
      window.location.href = `/class/${json.classroomId}`;
    } catch (err) {
      setLoading(false);
      alert('Network error: ' + err.message);
    }
  }

  return (
    <>
      <Head>
        <title>Create Class</title>
      </Head>
      <Navbar session={session} />
      <main style={{ padding: 24 }}>
        <div
          style={{
            maxWidth: 700,
            margin: '0 auto',
            border: '1px solid #eee',
            padding: 20,
            borderRadius: 6
          }}
        >
          <h2>Create Class</h2>
          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontWeight: 600 }}>
                Class name
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                required
                style={{ width: '100%', padding: 8 }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontWeight: 600 }}>
                Description
              </label>
              <textarea
                value={desc}
                onChange={e => setDesc(e.target.value)}
                style={{ width: '100%', padding: 8, minHeight: 90 }}
              />
            </div>
            <div>
              <button
                type='submit'
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#222',
                  color: '#fff',
                  borderRadius: 4
                }}
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
