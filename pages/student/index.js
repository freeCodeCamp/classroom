// pages/student/index.js
import Navbar from '../../components/navbar';
import { getServerAuthSession } from '../../lib/auth';
import prisma from '../../prisma/prisma';

export async function getServerSideProps(ctx) {
  const session = await getServerAuthSession(ctx.req, ctx.res);
  if (!session || !session.user) {
    return { redirect: { destination: '/access-denied', permanent: false } };
  }

  // normalize id
  const idNum = Number(session.user.id);
  const userId = Number.isFinite(idNum) ? idNum : session.user.id;

  // Fetch classrooms where this user is a student.
  const rows = await prisma.classroom.findMany({
    where: {
      students: {
        some: {
          id: userId
        }
      }
    },
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
      session: { ...session, user: { ...session.user, id: userId } },
      classes
    }
  };
}

export default function StudentIndex({ session, classes }) {
  return (
    <>
      <Navbar session={session} />
      <main style={{ padding: 24 }}>
        <h1>Student Dashboard</h1>

        {classes.length === 0 ? (
          <>
            {/* Fixed unescaped apostrophe */}
            <p>You haven&apos;t joined any classes yet.</p>
          </>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {classes.map(c => (
              <div
                key={c.classroomId}
                style={{
                  border: '1px solid #ddd',
                  padding: 12,
                  borderRadius: 8
                }}
              >
                <div style={{ fontWeight: 700 }}>{c.classroomName}</div>
                <div>{c.description}</div>
                <div style={{ fontSize: 12, color: '#666' }}>
                  ID: {c.classroomId}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
