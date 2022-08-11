import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import TeacherAuthButton from '../components/teacherAuthButton';

export default function Navbar({ children }) {
  return (
    <div className='h-[38px]'>
      <div className='h-[38px] bg-[#0a0a23] text-white flex items-center flex-wrap p-1'>
        <div className='hidden lg:flex block flex-1 justify-end'></div>
        <Link href='/classes'>
          <a className='flex items-center'>
            <Image
              className=''
              priority
              layout='fixed'
              src='/images/fcc_primary_large.png'
              alt='FreeCodecamp Logo'
              width={210}
              height={24}
            ></Image>
          </a>
        </Link>
        <div className='flex-1 inline-flex justify-end'>
          {React.Children.toArray(children).length > 1 ? (
            children.map(children => (
              <div className='pl-2 hidden md:block' key={children}>
                <p>{children}</p>
              </div>
            ))
          ) : (
            <div className='pl-2 hidden md:block'>{children}</div>
          )}
          <div className='pl-2'>
            <TeacherAuthButton></TeacherAuthButton>
          </div>
        </div>
      </div>
    </div>
  );
}
