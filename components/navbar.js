import Image from 'next/legacy/image';
import Link from 'next/link';
import React from 'react';
import { useSession } from 'next-auth/react';
import AuthButton from '../components/authButton';

function updateClassesLinkLabel(child, isAdmin) {
  if (!child) return child;

  if (React.isValidElement(child)) {
    const isClassesLink =
      child.props.href === '/classes' && child.props.children === 'Classes';

    if (isClassesLink) {
      return React.cloneElement(child, {
        children: isAdmin ? 'Dashboard' : 'Classes'
      });
    }

    if (child.props.children) {
      const newChildren = React.Children.map(child.props.children, c =>
        updateClassesLinkLabel(c, isAdmin)
      );
      return React.cloneElement(child, { children: newChildren });
    }
  }

  return child;
}

function hasClassesLink(child) {
  if (!child) return false;
  if (React.isValidElement(child)) {
    if (child.props.href === '/classes') {
      return true;
    }
    if (child.props.children) {
      return React.Children.toArray(child.props.children).some(hasClassesLink);
    }
  }
  return false;
}

export default function Navbar({ children }) {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const hasAccess = role === 'ADMIN' || role === 'TEACHER';
  const isAdmin = role === 'ADMIN';

  const processedChildren = React.Children.toArray(children)
    .filter(child => {
      if (hasClassesLink(child)) {
        return hasAccess;
      }
      return true;
    })
    .map(child => updateClassesLinkLabel(child, isAdmin));

  return (
    <div className='h-[38px]'>
      <div className='h-[38px] bg-fcc-gray-90 text-white flex items-center flex-wrap p-1'>
        <div className='hidden lg:flex block flex-1 justify-end'></div>
        <Link href='/classes' className='flex items-center'>
          <Image
            className=''
            priority
            layout='fixed'
            src='/images/fcc_primary_large.png'
            alt='FreeCodecamp Logo'
            width={210}
            height={24}
          ></Image>
        </Link>
        <div className='flex-1 inline-flex justify-end'>
          {processedChildren.map(child => (
            <div className='pl-2 hidden md:block' key={child.key}>
              {child}
            </div>
          ))}
          <div className='pl-2'>
            <AuthButton></AuthButton>
          </div>
        </div>
      </div>
    </div>
  );
}
