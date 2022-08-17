import { getSession } from 'next-auth/react';
import Navbar from '../../../components/navbar';
import UpdateTeacherForm from '../../../components/updateTeacherForm';
import prisma from '../../../prisma/prisma';

export async function getServerSideProps(context) {
  const userSession = await getSession(context);
  if (!userSession) {
    context.res.writeHead(302, { Location: '/' });
    context.res.end();
    return {};
  }

  const teacherInfo = await prisma.User.findUnique({
    where: {
      id: context.params.id
    },
    select: {
      id: true,
      name: true,
      email: true,
      isAdminApproved: true
    }
  });

  return {
    props: {
      teacherInfo: teacherInfo
    }
  };
}

export default function Actions({ teacherInfo }) {
  return (
    <>
      <Navbar></Navbar>
      <UpdateTeacherForm teacherInfo={teacherInfo}></UpdateTeacherForm>
    </>
  );
}
