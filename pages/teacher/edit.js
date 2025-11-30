// pages/teacher/edit.js
import Head from 'next/head';
import Navbar from '../../components/navbar';
import { getServerAuthSession } from '../../lib/auth';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export async function getServerSideProps(ctx) {
  const session = await getServerAuthSession(ctx.req, ctx.res);
  if (!session?.user)
    return { redirect: { destination: '/access-denied', permanent: false } };
  return { props: { session } };
}

export default function EditClass({ session }) {
  const router = useRouter();
  const { id } = router.query;
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const r = await fetch(`/api/get_class?classroomId=${id}`);
      if (!r.ok) return;
      const json = await r.json();
      setName(json.classroomName || '');
      setDesc(json.description || '');
    })();
  }, [id]);

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/edit_class', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classroomId: id,
        classroomName: name,
        description: desc
      })
    });
    const j = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return alert('Save failed: ' + (j.error || res.status));
    router.push(`/class/${id}`);
  }

  return (
    <>
      <Head>
        <title>Edit class</title>
      </Head>
      <Navbar session={session} />
      <main style={{ padding: 24 }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2>Edit class</h2>
          <form onSubmit={handleSave}>
            <div style={{ marginBottom: 12 }}>
              <label>Name</label>
              <br />
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ width: '100%', padding: 8 }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Description</label>
              <br />
              <textarea
                value={desc}
                onChange={e => setDesc(e.target.value)}
                style={{ width: '100%', padding: 8, minHeight: 90 }}
              />
            </div>
            <button type='submit' disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
