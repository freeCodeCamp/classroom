import Image from 'next/image';
import React from 'react';

export default function Navbar({ children }) {
  return (
    <div className='bg-[#0a0a23] text-white p-8'>
      <div className='flex items-center flex-wrap'>
        <div className='flex-1 justify-end'></div>
        <div className='flex-1 text-center justify-end'>
          <Image
            priority
            layout='fixed'
            src='/images/fcc_primary_large.png'
            alt='FreeCodecamp Logo'
            width={330}
            height={40}
          ></Image>
        </div>
        <div className='flex-1 inline-flex justify-end'>
          {React.Children.toArray(children).length > 1 ? (
            children.map(children => (
              <div className='pl-2' key={children}>
                <p>{children}</p>
              </div>
            ))
          ) : (
            <div>{children}</div>
          )}
        </div>
      </div>
    </div>
  );
}
