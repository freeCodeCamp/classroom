// pages/teacher/manage.js  — REPLACE getServerSideProps with this exact code
import { getServerAuthSession } from '../../lib/auth';
import prisma from '../../prisma/prisma';

export async function getServerSideProps(ctx) {
  const session = await getServerAuthSession(ctx.req, ctx.res);

  // DEBUG (will appear in terminal)
  console.log(
    'manage getServerSideProps session:',
    JSON.stringify(session, null, 2)
  );

  if (!session || !session.user) {
    console.log('manage: no session -> redirect');
    return { redirect: { destination: '/access-denied', permanent: false } };
  }

  const role = String(session.user.role || '').toLowerCase();
  const idRaw = session.user.id;
  console.log('manage: role:', role, 'idRaw:', idRaw);

  if (role !== 'teacher' && role !== 'admin') {
    console.log('manage: role not teacher/admin -> redirect');
    return { redirect: { destination: '/access-denied', permanent: false } };
  }

  // normalize id (support number or string IDs)
  const idNum = Number(idRaw);
  const teacherId = Number.isFinite(idNum) ? idNum : idRaw;

  if (teacherId === undefined || teacherId === null) {
    console.log('manage: invalid teacherId -> redirect');
    return { redirect: { destination: '/access-denied', permanent: false } };
  }

  const classes = await prisma.classroom.findMany({
    where: { classroomTeacherId: teacherId },
    select: {
      classroomId: true,
      classroomName: true,
      description: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return {
    props: {
      session: { ...session, user: { ...session.user, id: teacherId } },
      classes
    }
  };
}
