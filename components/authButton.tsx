import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@freecodecamp/ui';
import type { ButtonProps } from '@freecodecamp/ui';
import type React from 'react';

/*
  Mirrors freeCodeCamp's header Login button (Header/components/login.tsx +
  universal-nav.css `.signup-btn`): the yellow CTA style, sized to fit the
  38px navbar. Pass `size` to render a regular-sized CTA outside the navbar.
*/
const navClassName =
  'btn-cta flex items-center justify-center max-h-[28px] min-w-[28px] px-1 sm:px-3 text-md whitespace-nowrap no-underline';

type AuthButtonProps = {
  callbackUrl?: string;
  size?: ButtonProps['size'];
};

export default function AuthButton({
  callbackUrl = '/',
  size
}: AuthButtonProps): React.JSX.Element {
  const { data: session } = useSession();
  const onClick = session
    ? () => signOut({ callbackUrl: '/' })
    : () => signIn(undefined, { callbackUrl });
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
