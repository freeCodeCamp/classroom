import { getSession } from 'next-auth/react';
import Navbar from '../../../components/navbar';
import UpdateUserForm from '../../../components/updateUserForm';
import redirectUser from '../../../util/redirectUser.js';

export async function getServerSideProps(context) {
  // Dynamic import to prevent Prisma from being bundled for client
  const { default: prisma } = await import('../../../prisma/prisma');

  const userSession = await getSession(context);
  if (!userSession) {
    return redirectUser('/error');
  }

  const user = await prisma.User.findUnique({
    where: {
      email: userSession['user']['email']
    },
    select: {
      email: true,
      role: true
    }
  });

  if (user.role != 'ADMIN') {
    return redirectUser('/error');
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
