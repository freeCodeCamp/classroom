import { getSession } from 'next-auth/react';

export async function requireRole(context, allowedRoles = []) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    };
  }

  const userRole = session.user.role?.toLowerCase();

  if (!allowedRoles.map(r => r.toLowerCase()).includes(userRole)) {
    return {
      redirect: {
        destination: '/unauthorized',
        permanent: false
      }
    };
  }

  return {
    props: { session }
  };
}
