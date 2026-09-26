import '@freecodecamp/ui/dist/base.css';
import '../styles/globals.css';
import { SessionProvider } from 'next-auth/react';

export default function MyApp({
  Component,
  pageProps: { session, ...pageProps }
}) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
