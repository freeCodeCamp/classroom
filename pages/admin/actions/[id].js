import { getSession } from 'next-auth/react';
import Navbar from '../../../components/navbar';
import UpdateUserForm from '../../../components/updateUserForm';
import prisma from '../../../prisma/prisma';

export async function getServerSideProps(context) {
  const userSession = await getSession(context);
  const user = await prisma.User.findUnique({
    where: {
      email: userSession['user']['email']
    },
    select: {
      email: true,
      role: true
    }
  });

  if (!userSession || user.role != 'ADMIN') {
    context.res.writeHead(302, { Location: '/error' });
    context.res.end();
    return {};
  }

  const userInfo = await prisma.User.findUnique({
    where: {
      id: context.params.id
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  });
  return {
    props: {
      userInfo: userInfo
    }
  };
}

export default function Actions({ userInfo }) {
  return (
    <>
      <Navbar></Navbar>
      <UpdateUserForm userInfo={userInfo}></UpdateUserForm>
    </>
  );
}
