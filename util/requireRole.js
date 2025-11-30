import { getSession } from 'next-auth/react';

export async function requireRole(context, allowedRoles) {
  const session = await getSession(context);

  if (!session || !allowedRoles.includes(session.user.role)) {
    return {
      redirect: {
        destination: '/access-denied',
        permanent: false
      }
    };
  }

  return { props: { session } };
}
