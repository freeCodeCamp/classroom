import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MultiSelect } from 'react-multi-select-component';

export default function ClassInviteTable({
  currentClass,
  certificationNames,
  userId
}) {
  const router = useRouter();
  const [showOptions, setShowOptions] = useState(false);
  const [editOn, setEditOn] = useState(false);
  const [formData, setFormData] = useState({});

  const getSelectedCerts = () => {
    const selectedCerts = currentClass.fccCertifications.map(x => x);
    return certificationNames.filter(x => selectedCerts.includes(x.value));
  };
  const [selected, setSelected] = useState(() =>
    getSelectedCerts().map(x => ({
      value: x['value'],
      label: x['displayName']
    }))
  );

  const ref = useRef();
  const userCurrentDomain = process.env.NEXTAUTH_URL;

  const copy = async () => {
    //Add the full URL to send to student
    await navigator.clipboard.writeText(
      `${userCurrentDomain}/join/` + currentClass.classroomId
    );

    toast('Class code successfully copied', {
      className: 'toast-message'
    });
  };

  const deleteClass = async () => {
    if (confirm('Do you want to delete this class?') == true) {
      const JSONdata = JSON.stringify(currentClass.classroomId);
      try {
        const res = await fetch(`/api/deleteclass`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSONdata
        });
        if (res.status === 403) {
          router.reload('/classes');
          alert('Cannot delete class, not valid user');
        } else {
          router.reload('/classes');
          alert('Successfully Deleted Class');
        }
      } catch (error) {
        alert('Sorry, there was an error on our end. Please try again later.');
        console.log(error);
      }
    }
  };
  async function saveEdit(e) {
    setEditOn(false);
    e.preventDefault();
    const fccCertifications = [];
    selected.map(x => fccCertifications.push(x.value));
    fccCertifications.sort(function (a, b) {
      return a - b;
    });
    formData.fccCertifications = fccCertifications;
    formData.classroomId = currentClass.classroomId;
    const JSONdata = JSON.stringify(formData);
    try {
      const res = await fetch(`/api/editclass`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSONdata
      });
      if (res.status === 304) {
        router.reload('/classes');
        alert('No changes modified.');
      } else {
        router.reload('/classes');
        alert('Successfully Edited Class');
      }
    } catch (error) {
      alert('Sorry, there was an error on our end. Please try again later.');
      console.log(error);
    }
  }

  const clickedEdit = () => {
    setEditOn(true);
  };

  const handleCancelClick = () => {
    setSelected(getSelectedCerts());
    setEditOn(false);
  };
  useEffect(() => {
    const checkIfClickedOutside = e => {
      if (showOptions && ref.current && !ref.current.contains(e.target)) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', checkIfClickedOutside);

    return () => {
      document.removeEventListener('mousedown', checkIfClickedOutside);
    };
  }, [showOptions]);
  return (
    <>
      <div className='p-7'>
        <div
          href='#'
          className='group block max-w-xl mx-auto p-6 bg-fcc-gray-15 border-2 border-fcc-gray-90 ring-1 ring-slate-900/5 shadow-lg space-y-3 hover:bg-fcc-gray-90 hover:ring-sky-500'
        >
          <div ref={ref} className='group flex items-center'>
            <h2 className='text-slate-900 group-hover:text-white text-l font-semibold'>
              Classroom: {currentClass.classroomName}
            </h2>
            {/* <-------Menu Item Selection -----> */}
            <div className='wrapper group ml-auto flex items-center'>
              <div className='relative inline-block text-right'>
                <div>
                  <button
                    onClick={() => setShowOptions(!showOptions)}
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
                    <div className='py-1' role='none'>
                      <a
                        onClick={clickedEdit}
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
                    <div className='py-1' role='none'>
                      <a
                        onClick={copy}
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
                        onClick={deleteClass}
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

          {editOn && (
            <>
              <div className='bg-zinc-200 opacity-100 fixed inset-0 z-50'>
                <div className='flex h-screen justify-center items-center'>
                  <div className='flex-col justify-center bg-fcc-gray-90 py-12 px-24 border-4 border-sky-500 rounded-xl overflow-auto max-h-screen'>
                    <div className='flex text-lg text-white justify-center items-center'>
                      Edit Class
                    </div>

                    <form className='mt-8 space-y-6' onSubmit={saveEdit}>
                      <input type='hidden' name='remember' value='true'></input>
                      <div className='rounded-md shadow-sm -space-y-px'>
                        <div>
                          <h1 className='text-white'>Edit Class Name:</h1>
                          <label htmlFor='class-name' className='sr-only'>
                            Class Name
                          </label>
                          <input
                            onChange={e =>
                              setFormData({
                                ...formData,
                                className: e.target.value,
                                classroomTeacherId: userId
                              })
                            }
                            id='class-name'
                            name='classname'
                            className='appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm'
                            placeholder={currentClass.classroomName}
                          ></input>
                        </div>
                      </div>
                      <div className='rounded-md shadow-sm -space-y-px'>
                        <div>
                          <h1 className='text-white'>Edit Description:</h1>
                          <label htmlFor='description-text' className='sr-only'>
                            Description
                          </label>
                          <textarea
                            onChange={e =>
                              setFormData({
                                ...formData,
                                description: e.target.value
                              })
                            }
                            id='description-text'
                            name='description'
                            className='appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm'
                            placeholder={currentClass.description}
                          ></textarea>
                        </div>
                      </div>
                      <div className='rounded-md shadow-sm -space-y-px w-60 lg:w-72 2xl:w-96'>
                        <div>
                          <h1 className='text-white'>
                            Edit Select Certifications:
                          </h1>
                          <MultiSelect
                            options={certificationNames.map(x => ({
                              value: x['value'],
                              label: x['displayName']
                            }))}
                            value={selected}
                            onChange={setSelected}
                            labelledBy='Select'
                          />
                        </div>
                      </div>

                      <div className='flex items-center justify-between'></div>
                      <div className='flex items-center justify-center'>
                        <button
                          type='submit'
                          className=' rounded px-4 py-2 text-white bg-green-700'
                        >
                          Update
                        </button>
                        <button
                          onClick={handleCancelClick}
                          className='rounded px-5 py-2 ml-10 text-white bg-[#e3342f]'
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <h1 className='text-slate-900 group-hover:text-white text-l'>
              {currentClass.description}
            </h1>
          </div>
          <Link href={`/dashboard/v2/${currentClass.classroomId}`} passHref>
            <button className='border-2 border-fcc-gray-15 bg-fcc-gray-90 text-white font-bold py-2 px-4 rounded'>
              View Class
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}
