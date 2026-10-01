import Image from 'next/legacy/image';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Dropdown, MenuItem } from '@freecodecamp/ui';
import AuthButton from '../components/authButton';

/*
  Mirrors freeCodeCamp's header (client/src/components/Header, universal-nav.css):
  a 38px dark bar with the logo centered, 28px bordered nav buttons, and the
  yellow Sign in button. Below 768px the links collapse into a Menu dropdown
  (unless there's only one link).
*/
const navButtonClassName =
  'flex items-center justify-center h-[28px] min-w-[28px] px-1 sm:px-3 text-md text-gray-0 bg-gray-900 border-1 border-solid border-gray-0 no-underline hover:bg-gray-0 hover:text-gray-900 focus:bg-gray-0 focus:text-gray-900';

// The Dropdown toggle ships the library's gray button classes; these
// overrides (including the open state) keep it in the nav button style.
const menuToggleClassName = `${navButtonClassName} py-0 border-1 aria-expanded:bg-gray-0 aria-expanded:text-gray-900 aria-expanded:border-gray-0`;

const isModifiedClick = event =>
  event.button !== 0 ||
  event.metaKey ||
  event.ctrlKey ||
  event.shiftKey ||
  event.altKey;

export const getNavLinks = (role, extraLinks = []) => {
  const links = [...extraLinks];
  if (role === 'ADMIN') {
    links.push({ href: '/admin', label: 'Dashboard' });
  } else if (role === 'TEACHER') {
    links.push({ href: '/classes', label: 'Classes' });
  }
  links.push({ href: '/', label: 'Home' });
  return links;
};

export default function Navbar({ extraLinks = [], hideAuthButton = false }) {
  const { data: session } = useSession();
  const router = useRouter();
  const links = getNavLinks(session?.user?.role, extraLinks);
  // A single link (just Home) fits on phones, so only collapse when there
  // is more than one.
  const collapseOnPhones = links.length > 1;

  const navigate = href => event => {
    if (isModifiedClick(event)) {
      return;
    }
    event.preventDefault();
    router.push(href);
  };

  return (
    <nav
      aria-label='Main'
      className='flex items-center justify-between h-[38px] px-[5px] min-[401px]:px-[15px] bg-gray-900 text-gray-0 text-md'
    >
      <div className='hidden md:block flex-1' />
      {/* The logo shrinks on phones so it fits next to Menu and Sign in. */}
      <NextLink
        href='/'
        className='flex items-center shrink-0 w-[140px] sm:w-[210px] no-underline hover:bg-transparent focus:bg-transparent'
      >
        <Image
          priority
          layout='intrinsic'
          src='/images/fcc_primary_large.png'
          alt='freeCodeCamp Classroom home'
          width={210}
          height={24}
        />
      </NextLink>
      <div className='flex flex-1 items-center justify-end gap-[10px]'>
        <ul
          className={`${
            collapseOnPhones ? 'hidden md:flex' : 'flex'
          } items-center gap-[10px] m-0 p-0 list-none`}
        >
          {links.map(link => (
            <li key={link.href}>
              <NextLink href={link.href} className={navButtonClassName}>
                {link.label}
              </NextLink>
            </li>
          ))}
        </ul>
        {collapseOnPhones && (
          <div className='md:hidden'>
            <Dropdown>
              <Dropdown.Toggle className={menuToggleClassName}>
                Menu
              </Dropdown.Toggle>
              <Dropdown.Menu className='right-0 mt-1'>
                {links.map(link => (
                  <MenuItem
                    key={link.href}
                    href={link.href}
                    onClick={navigate(link.href)}
                  >
                    {link.label}
                  </MenuItem>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        )}
        {!hideAuthButton && <AuthButton />}
      </div>
    </nav>
  );
}
