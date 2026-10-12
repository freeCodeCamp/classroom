import Head from 'next/head';
import { getSession } from 'next-auth/react';
import Navbar from '../../../components/navbar';
import UpdateUserForm from '../../../components/updateUserForm';
import redirectUser from '../../../util/redirectUser';
import type React from 'react';
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import type { User } from '../../../generated/prisma/client';

type ActionsProps = {
  userInfo: Pick<User, 'id' | 'name' | 'email' | 'role'> | null;
};

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<ActionsProps>> {
  // Dynamic import to prevent Prisma from being bundled for client
  const { default: prisma } = await import('../../../prisma/prisma');

  const userSession = await getSession(context);
  if (!userSession) {
    return redirectUser('/error');
  }

  const user = (await prisma.user.findUnique({
    where: {
      email: userSession['user']['email']!
    },
    select: {
      email: true,
      role: true
    }
  }))!;

  if (user.role != 'ADMIN') {
    return redirectUser('/error');
  }

  const userInfo = await prisma.user.findUnique({
    where: {
      id: String(context.params?.id)
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

export default function Actions({ userInfo }: ActionsProps): React.JSX.Element {
  return (
    <>
      <Head>
        <title>Edit user | freeCodeCamp Classroom</title>
      </Head>
      <Navbar></Navbar>
      <UpdateUserForm userInfo={userInfo!}></UpdateUserForm>
    </>
  );
}
