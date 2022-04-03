import React, { useState } from 'react';

export default function ClassInviteTable({ classes }) {
<<<<<<< HEAD
  const [showOptions, setShowOptions] = useState(false);
  const handleClick = () => {
    setShowOptions(!showOptions);
  };
  return (
    <>
      <div className='p-7'>
        <div
=======
  const copy = async () => {
    await navigator.clipboard.writeText(classes.classroomId);
    alert(
      'Text copied for:' +
        '\n' +
        'Class: ' +
        classes.classroomName +
        '\n' +
        'Invite Code: ' +
        classes.classroomId
    );
  };
  return (
    <>
      <div className={'p-5'}>
        <a
          onClick={copy}
>>>>>>> 012a289 (adding copy to clipboard functionality)
          href='#'
          className='group block max-w-xl mx-auto p-6 bg-[#d0d0d5] border-2 border-[#0a0a23] ring-1 ring-slate-900/5 shadow-lg space-y-3 hover:bg-[#0a0a23] hover:ring-sky-500'
        >
          <div className='group flex items-center'>
            <h2 className='text-slate-900 group-hover:text-white text-l font-semibold'>
              Classroom: {classes.classroomName}
            </h2>

            {/* <-------Menu Item Selection -----> */}
            <div className='group ml-auto flex items-center'>
              <div className='relative inline-block text-right'>
                <div>
                  <button
                    onClick={handleClick}
                    type='button'
                    className='inline-flex justify-center w-full rounded-md border border-gray-300 shadow-xl px-2 py-1 bg-white text-sm font-medium text-gray-700 hover:bg-[#ffbf00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500'
                    id='menu-button'
                    aria-expanded='true'
                    aria-haspopup='true'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-4 w-4'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                      strokeWidth='2'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z'
                      />
                    </svg>
                  </button>
                </div>
                {showOptions && (
                  <div
                    className='flex-row origin-top-right absolute -right-20 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none'
                    role='menu'
                    aria-orientation='vertical'
                    aria-labelledby='menu-button'
                    tabIndex='-1'
                  >
                    <div clasclassNames='py-1' role='none'>
                      <a
                        href='#'
                        className='group flex items-center text-gray-700 block px-4 py-2 text-sm hover:bg-gray-300'
                        role='menuitem'
                        tabIndex='-1'
                        id='menu-item-0'
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-6 w-6'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                          strokeWidth='2'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
                          />
                        </svg>
                        <span className='group flex pl-5 items-center'>
                          Edit
                        </span>
                      </a>
                    </div>
                    <div clasclassNames='py-1' role='none'>
                      <a
                        href='#'
                        className='group flex items-center  text-gray-700 block px-4 py-2 text-sm hover:bg-gray-300'
                        role='menuitem'
                        tabIndex='-1'
                        id='menu-item-1'
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-6 w-6'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                          strokeWidth='2'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3'
                          />
                        </svg>
                        <span className='group flex pl-5 items-center'>
                          Invite
                        </span>
                      </a>
                    </div>
                    <div className='py-1' role='none'>
                      <a
                        href='#'
                        className='group flex items-center text-gray-700 block px-4 py-2 text-sm hover:bg-gray-300'
                        role='menuitem'
                        tabIndex='-1'
                        id='menu-item-2'
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-6 w-6'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                          strokeWidth='2'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                          />
                        </svg>
                        <div className='group flex pl-5 items-center'>
                          Delete
                        </div>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button className='border-2 border-[#d0d0d5] bg-[#0a0a23] text-white font-bold py-2 px-4 rounded'>
            View Class
          </button>
        </div>
      </div>
    </>
  );
}
