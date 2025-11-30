// components/navbar.js
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import AuthButton from '../components/authButton';
import { useSession } from 'next-auth/react';

export default function Navbar({ children }) {
  const { data: session } = useSession();
  const userRole = session?.user?.role?.toLowerCase(); // "teacher" | "student" | "admin" | "none"

  return (
    <div className='h-[38px]'>
      <div className='h-[38px] bg-fcc-gray-90 text-white flex items-center flex-wrap p-1'>
        {/* LEFT SPACER */}
        <div className='hidden lg:flex block flex-1 justify-end'></div>

        {/* LOGO */}
        <Link href='/teacher/manage' className='flex items-center'>
          <Image
            priority
            layout='fixed'
            src='/images/fcc_primary_large.png'
            alt='FreeCodeCamp Logo'
            width={210}
            height={24}
          />
        </Link>

        {/* RIGHT SIDE */}
        <div className='flex-1 inline-flex justify-end items-center'>
          {/* CHILDREN ITEMS */}
          {React.Children.toArray(children).map(child => (
            <div className='pl-2 hidden md:block' key={child.key}>
              {child}
            </div>
          ))}

          {/* ⭐ MENTOR–MENTEE DROPDOWN */}
          {(userRole === 'teacher' || userRole === 'student') && (
            <div className='pl-2 hidden md:block'>
              <div className='relative group'>
                <button className='px-2 py-1 bg-blue-600 rounded hover:bg-blue-700 transition'>
                  👥 Mentor–Mentee ▾
                </button>

                {/* FIXED DROPDOWN — stays open while cursor is inside */}
                <div
                  className='
                    absolute right-0 mt-1 w-56 bg-white text-black rounded shadow-lg z-50
                    opacity-0 pointer-events-none
                    group-hover:opacity-100 group-hover:pointer-events-auto
                    transition-all duration-200
                  '
                >
                  {/* Teacher: Mentor Setup */}
                  {userRole === 'teacher' && (
                    <Link
                      href='/mentor/setup'
                      className='block px-4 py-2 hover:bg-gray-100'
                    >
                      ⭐ Mentor Setup
                    </Link>
                  )}

                  {/* Student: Request Mentor */}
                  {userRole === 'student' && (
                    <Link
                      href='/mentee/request'
                      className='block px-4 py-2 hover:bg-gray-100'
                    >
                      🎒 Request Mentor
                    </Link>
                  )}

                  {/* Teacher: Mentorship Dashboard */}
                  {userRole === 'teacher' && (
                    <Link
                      href='/mentorship/dashboard'
                      className='block px-4 py-2 hover:bg-gray-100'
                    >
                      📊 Mentorship Dashboard
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ADMIN PANEL */}
          {userRole === 'admin' && (
            <div className='pl-2 hidden md:block'>
              <Link
                href='/admin'
                className='px-2 py-1 bg-red-600 rounded hover:bg-red-700 transition'
              >
                🔐 Admin Panel
              </Link>
            </div>
          )}

          {/* TEACHER DASHBOARD */}
          {userRole === 'teacher' && (
            <div className='pl-2 hidden md:block'>
              <Link
                href='/teacher'
                className='px-2 py-1 bg-green-600 rounded hover:bg-green-700 transition'
              >
                📘 Teacher
              </Link>
            </div>
          )}

          {/* STUDENT DASHBOARD */}
          {userRole === 'student' && (
            <div className='pl-2 hidden md:block'>
              <Link
                href='/student'
                className='px-2 py-1 bg-yellow-600 rounded hover:bg-yellow-700 transition'
              >
                🎒 Student
              </Link>
            </div>
          )}

          {/* SIGN-IN / SIGN-OUT BUTTON */}
          <div className='pl-2'>
            <AuthButton />
          </div>
        </div>
      </div>
    </div>
  );
}
