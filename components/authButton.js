import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@freecodecamp/ui';

/*
  Mirrors freeCodeCamp's header Login button (Header/components/login.tsx +
  universal-nav.css `.signup-btn`): the yellow CTA style, sized to fit the
  38px navbar. Pass `size` to render a regular-sized CTA outside the navbar.
*/
const navClassName =
  'btn-cta flex items-center justify-center max-h-[28px] min-w-[28px] px-1 sm:px-3 text-md no-underline';

export default function AuthButton({ callbackUrl = '/', size }) {
  const { data: session } = useSession();
  const onClick = session
    ? () => signOut({ callbackUrl: '/' })
    : () => signIn(null, { callbackUrl });
  const label = session ? 'Sign out' : 'Sign in';

  if (size) {
    return (
      <Button size={size} className='btn-cta' onClick={onClick}>
        {label}
      </Button>
    );
  }

  return (
    <button type='button' className={navClassName} onClick={onClick}>
      {label}
    </button>
  );
}
