import { useState, useEffect } from 'react';
import Navbar from '../components/navbar';
import Link from 'next/link';

function Profile() {
  // Set up initial user data
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    university: '',
    bio: ''
  });

  // Load user data from localStorage if available
  useEffect(() => {
    if (localStorage.getItem('userData')) {
      setUserData(JSON.parse(localStorage.getItem('userData')));
    }
  }, []);

  // Update user data and localStorage
  function handleSave() {
    localStorage.setItem('userData', JSON.stringify(userData));
  }

  return (
    <div className='bg-zinc-200 opacity-100 fixed inset-0 z-50'>
      <Navbar>
        <div className='border-solid border-2 pl-4 pr-4'>
          <Link href={'/classes'}>Classes</Link>
        </div>
        <div className='border-solid border-2 pl-4 pr-4'>
          <Link href={'/'}> Menu</Link>
        </div>
      </Navbar>
      <div className='flex h-screen justify-center items-center'>
        <div className='flex-col justify-center bg-[#0a0a23] py-12 px-24 border-4 border-sky-500 rounded-x1 overflow-auto max-h-screen'>
          <div className='flex text-lg text-white justify-center items-center'>
            <div className='profile'>
              <div className='profile-pic'>
                <img
                  src={`https://via.placeholder.com/150x150?text=${userData.name
                    .charAt(0)
                    .toUpperCase()}`}
                  alt='Profile picture'
                />
              </div>
              <div className='username'>{userData.name} </div>
              <form className='mt-8 space-y-8'>
                <div className='rounded-md text-white shadow-sm -space-y-px'>
                  <label htmlFor='name'>Name: </label>
                  <div className='text-black'>
                    <input
                      id='name'
                      type='text'
                      value={userData.name}
                      onChange={e =>
                        setUserData({ ...userData, name: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className='rounded-md shadow-sm -space-y-px'>
                  <label htmlFor='email'>Email: </label>
                  <div className='text-black'>
                    <input
                      id='email'
                      type='email'
                      value={userData.email}
                      onChange={e =>
                        setUserData({ ...userData, email: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className='rounded-md shadow-sm -space-y-px'>
                  <label htmlFor='university'>University: </label>
                  <div className='text-black'>
                    <input
                      id='university'
                      type='text'
                      value={userData.university}
                      onChange={e =>
                        setUserData({ ...userData, university: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className='rounded-md shadow-sm -space-y-px'>
                  <label htmlFor='bio'>Bio: </label>
                  <div className='text-black'>
                    <textarea
                      id='bio'
                      value={userData.bio}
                      onChange={e =>
                        setUserData({ ...userData, bio: e.target.value })
                      }
                    ></textarea>
                  </div>
                </div>
                <button
                  type='submit'
                  onClick={handleSave}
                  className=' rounded px-4 py-2 text-white bg-green-700'
                >
                  Save changes
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
