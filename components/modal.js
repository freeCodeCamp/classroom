import { useState } from 'react';
import { useRouter } from 'next/router';
import { MultiSelect } from 'react-multi-select-component';

export default function Modal({ userId, certificationNames }) {
  const handleCancelClick = () => {
    setModalOn(false);
  };

  const [formData, setFormData] = useState({});
  const [selected, setSelected] = useState([]);

  const [modalOn, setModalOn] = useState(false);
  const router = useRouter();

  const clicked = () => {
    setModalOn(true);
  };
  async function saveClass(e) {
    setModalOn(false);
    e.preventDefault();
    const fccCertifications = [];
    selected.map(x => fccCertifications.push(x.value));
    fccCertifications.sort();
    formData.fccCertifications = fccCertifications;

    const response = await fetch(`/api/create_class_teacher`, {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    router.reload('http://localhost:3000/classes');
    alert('Successfully Created Class');
    return await response.json();
  }

  return (
    <>
      <div>
        <div className='flex justify-center'>
          <div
<<<<<<< HEAD
            className='flex cursor-pointer justify-center w-1/3 bg-blue-400 p-4 m-6 rounded-md text-white'
=======
            className='flex cursor-pointer justify-center p-4 m-6 rounded-md hover:bg-[#f1be32] shadedow-lg border-solid border-color: inherit; border-2 pl-4 pr-4 bg-[#feac32] text-black'
>>>>>>> 7683bcf (fixed the options button in classes, Delete classes works, fixed size of button, fixed the size of certifications being picked when creating a class.)
            onClick={clicked}
          >
            Create Class
          </div>
        </div>
        {modalOn && (
          <>
            <div className='bg-zinc-200 opacity-100 fixed inset-0 z-50'>
              <div className='flex h-screen justify-center items-center'>
                <div className='flex-col justify-center bg-black py-12 px-24 border-4 border-sky-500 rounded-xl '>
                  <div className='flex text-lg text-zinc-800 mb-10 ml-10'>
                    Create Class
                  </div>

                  <form className='mt-8 space-y-6' onSubmit={saveClass}>
                    <input type='hidden' name='remember' value='true'></input>
                    <div className='rounded-md shadow-sm -space-y-px'>
                      <div>
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
                          required
                          className='appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm'
                          placeholder='Class Name'
                        ></input>
                      </div>
                    </div>
                    <div className='rounded-md shadow-sm -space-y-px'>
                      <div>
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
                          required
                          className='appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm'
                          placeholder='Description'
                        ></textarea>
                      </div>
                    </div>
                    <div className='rounded-md shadow-sm -space-y-px max-w-md w-full'>
                      <div>
                        <h1>Select Here</h1>
                        <MultiSelect
                          hidePlaceholder={false}
                          options={certificationNames}
                          value={selected}
                          onChange={setSelected}
                          labelledBy='Select'
                        />
                      </div>
                    </div>

                    <div className='flex items-center justify-between'></div>
                    <div className='flex items-center ml-10'>
                      <button
                        type='submit'
                        className=' rounded px-4 py-2 text-white bg-green-400 '
                      >
                        Yes
                      </button>
                      <button
                        onClick={handleCancelClick}
                        className='rounded px-5 py-2 ml-4 text-white bg-[#e3342f] '
                      >
                        No
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
