import { useSession } from 'next-auth/react';

export default function Layout({ children }) {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      return <div>onUnauthenticated</div>;
    }
  });

  if (status === 'loading') {
    return <div>Loading or not authenticated</div>;
  }

  return <div>{children}</div>;
}
