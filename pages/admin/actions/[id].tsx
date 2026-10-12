import Head from 'next/head';
import Navbar from '../../../components/navbar';
import UpdateUserForm from '../../../components/updateUserForm';
import redirectUser from '../../../util/redirectUser';
import { getSessionUser } from '../../../util/pageAuth';
import prisma from '../../../prisma/prisma';
import { Role } from '../../../util/roles';
import type React from 'react';
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import type { User } from '../../../generated/prisma/client';

type ActionsProps = {
  userInfo: Pick<User, 'id' | 'name' | 'email' | 'role'>;
};

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<ActionsProps>> {
  const sessionUser = await getSessionUser(context);
  if (!sessionUser) return redirectUser('/error');
  const { user } = sessionUser;

  if (user.role !== Role.ADMIN) {
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
  if (!userInfo) {
    return { notFound: true };
  }
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
      <UpdateUserForm userInfo={userInfo}></UpdateUserForm>
    </>
  );
}
