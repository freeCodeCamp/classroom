// pages/teacher/index.js
import Head from 'next/head';
import Navbar from '../../components/navbar';
import { getServerAuthSession } from '../../lib/auth';
import prisma from '../../prisma/prisma';
import { useState } from 'react';

/* ---------- getServerSideProps ---------- */
export async function getServerSideProps(ctx) {
  const session = await getServerAuthSession(ctx.req, ctx.res);

  if (!session || !session.user) {
    return { redirect: { destination: '/access-denied', permanent: false } };
  }

  const role = String(session.user.role || '').toLowerCase();
  if (role !== 'teacher' && role !== 'admin') {
    return { redirect: { destination: '/access-denied', permanent: false } };
  }

  const idNum = Number(session.user.id);
  const teacherId = Number.isFinite(idNum) ? idNum : session.user.id;

  const rows = await prisma.classroom.findMany({
    where: { classroomTeacherId: teacherId },
    select: {
      classroomId: true,
      classroomName: true,
      description: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const classes = rows.map(c => ({
    ...c,
    createdAt: c.createdAt?.toISOString() ?? null
  }));

  return {
    props: {
      session: { ...session, user: { ...session.user, id: teacherId } },
      classes
    }
  };
}

/* ------------------ Client component ------------------ */
export default function TeacherIndex({ session, classes: initialClasses }) {
  const [classes, setClasses] = useState(initialClasses || []);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [loadingCreate, setLoadingCreate] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  async function getUsableSession() {
    if (session && session.user) return session;
    try {
      const r = await fetch('/api/auth/session');
      return await r.json();
    } catch {
      return null;
    }
  }

  /* ---------------- Create ---------------- */
  async function handleCreate(e) {
    e.preventDefault();
    setLoadingCreate(true);

    const localSession = await getUsableSession();
    if (!localSession?.user?.id) {
      setLoadingCreate(false);
      console.warn('Session missing. Please sign in.');
      return;
    }

    const payload = {
      classroomName: name,
      description: desc,
      classroomTeacherId: localSession.user.id
    };

    try {
      const res = await fetch('/api/create_class_teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert('Create failed: ' + (data.error || res.status));
        setLoadingCreate(false);
        return;
      }

      setClasses(p => [data, ...p]);
      setName('');
      setDesc('');
      setLoadingCreate(false);
    } catch (err) {
      console.error('Network error create:', err);
      setLoadingCreate(false);
    }
  }

  /* ---------------- Delete ---------------- */
  async function handleDelete(classroomId) {
    if (!confirm('Delete this class? This cannot be undone.')) return;

    try {
      const res = await fetch('/api/deleteclass', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classroomId })
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert('Delete failed: ' + (json.error || res.status));
        return;
      }

      setClasses(p => p.filter(c => c.classroomId !== classroomId));
    } catch (err) {
      console.error('Network error delete:', err);
      alert('Network error deleting class');
    }
  }

  /* ---------------- Edit ---------------- */
  function startEdit(c) {
    setEditingId(c.classroomId);
    setEditName(c.classroomName || '');
    setEditDesc(c.description || '');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
    setEditDesc('');
  }

  async function saveEdit(classroomId) {
    try {
      const res = await fetch('/api/editclass', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classroomId,
          classroomName: editName,
          description: editDesc
        })
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert('Save failed: ' + (json.error || res.status));
        return;
      }

      setClasses(p => p.map(c => (c.classroomId === classroomId ? json : c)));

      cancelEdit();
    } catch (err) {
      console.error('Network saveEdit:', err);
      alert('Network error saving changes');
    }
  }

  /* ---------------- Invite Student ---------------- */
  async function inviteStudent(classroomId) {
    const email = prompt(
      'Student email to invite (optional). Leave blank to just copy link.'
    );

    const url = `${window.location.origin}/api/student_email_join`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classroomId, email })
      });

      let bodyText = '';
      try {
        bodyText = await res.text();
      } catch {
        bodyText = '<no body>';
      }

      if (!res.ok) {
        let parsed = {};
        try {
          parsed = JSON.parse(bodyText || '{}');
        } catch {
          console.log('caughts');
        }
        const errMsg = parsed.error || parsed.message || `status ${res.status}`;
        alert('Invite failed: ' + errMsg);
        return;
      }

      const json = JSON.parse(bodyText || '{}');
      const joinLink =
        json.joinLink ||
        `${window.location.origin}/join?classroomId=${encodeURIComponent(
          classroomId
        )}`;

      try {
        await navigator.clipboard.writeText(joinLink);
        alert('Invite link copied to clipboard.');
        return;
      } catch {
        prompt('Copy this invite link:', joinLink);
      }
    } catch (err) {
      console.error('inviteStudent: network error', err);
      alert('Network error sending invite');
    }
  }

  return (
    <>
      <Head>
        <title>Teacher Dashboard</title>
      </Head>

      <Navbar session={session} />
      <main style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
        <section style={{ display: 'flex', gap: 24 }}>
          {/* ---------- Create Class ---------- */}
          <div
            style={{
              flex: 1,
              border: '1px solid #eee',
              padding: 18,
              borderRadius: 8
            }}
          >
            <h2>Create Class</h2>

            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontWeight: 600 }}>
                  Class name
                </label>
                <input
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
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
                  style={{ width: '100%', padding: 8, minHeight: 80 }}
                />
              </div>

              <div>
                <button
                  type='submit'
                  disabled={loadingCreate}
                  style={{ padding: '8px 14px' }}
                >
                  {loadingCreate ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>

          {/* ---------- Class List ---------- */}
          <div style={{ flex: 2 }}>
            <h2>Your Classes</h2>

            {classes.length === 0 && (
              <>
                {/* fixed apostrophe */}
                <p>You don&apos;t have any classes yet.</p>
              </>
            )}

            <div style={{ display: 'grid', gap: 12 }}>
              {classes.map(c => (
                <div
                  key={c.classroomId}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: 8,
                    padding: 12
                  }}
                >
                  {editingId === c.classroomId ? (
                    <>
                      <label>Name</label>
                      <input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        style={{ width: '100%', padding: 8 }}
                      />

                      <label>Description</label>
                      <textarea
                        value={editDesc}
                        onChange={e => setEditDesc(e.target.value)}
                        style={{ width: '100%', padding: 8 }}
                      />

                      <div style={{ marginTop: 8 }}>
                        <button onClick={() => saveEdit(c.classroomId)}>
                          Save
                        </button>
                        <button onClick={cancelEdit} style={{ marginLeft: 8 }}>
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 700
                        }}
                      >
                        {c.classroomName}
                      </div>
                      <div style={{ color: '#666' }}>{c.description}</div>

                      <div
                        style={{
                          fontSize: 12,
                          color: '#999',
                          marginTop: 8
                        }}
                      >
                        ID: {c.classroomId} · Created:{' '}
                        {c.createdAt
                          ? new Date(c.createdAt).toLocaleString()
                          : ''}
                      </div>

                      <div
                        style={{
                          marginTop: 12,
                          display: 'flex',
                          gap: 8
                        }}
                      >
                        <button onClick={() => startEdit(c)}>Edit</button>
                        <button onClick={() => inviteStudent(c.classroomId)}>
                          Invite
                        </button>
                        <button
                          onClick={() => handleDelete(c.classroomId)}
                          style={{
                            background: '#ff4d4f',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
