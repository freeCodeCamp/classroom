import { useState } from 'react';
import { MultiSelect } from 'react-multi-select-component';
import DisplayNotification from './displayNotification';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Modal({
  userId,
  certificationNames,
  setCurrentClassrooms
}) {
  const handleCancelClick = () => {
    setSelected([]);
    setModalOn(false);
  };

  const [formData, setFormData] = useState({});
  const [selected, setSelected] = useState([]);

  const [modalOn, setModalOn] = useState(false);

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
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      let jsonRes = await response.json()
      let newClassroom = {
        classroomName: jsonRes.classroomName,
        description: jsonRes.description,
        classroomTeacherId: jsonRes.classroomTeacherId,
        fccCertifications: jsonRes.fccCertifications,
        classroomId: jsonRes.classroomId,
        createdAt: jsonRes.createdAt
      };
      setCurrentClassrooms(currentClassrooms => [
        ...currentClassrooms,
        newClassroom
      ]);
      setSelected([]);
      DisplayNotification('Success', 'Class Created!');
    } else {
      DisplayNotification('Error', 'Class could not be created!');
    }
  }

  return (
    <>
      <div>
        <div>
          <ToastContainer />
        </div>
        <div>
          <ToastContainer />
        </div>
        <div className='flex justify-center'>
          <div
            className='flex cursor-pointer justify-center p-4 m-6 rounded-md hover:bg-fcc-primary-yellow shadedow-lg border-solid border-color: inherit; border-2 pl-4 pr-4 bg-[#feac32] text-black'
            onClick={clicked}
          >
            Create Class
          </div>
        </div>
        {modalOn && (
          <>
            <div className='bg-zinc-200 opacity-100 fixed inset-0 z-50'>
              <div className='flex h-screen justify-center items-center'>
                <div className='flex-col justify-center bg-fcc-gray-90 py-12 px-24 border-4 border-sky-500 rounded-xl overflow-auto max-h-screen'>
                  <div className='flex text-lg text-white justify-center items-center'>
                    Create Class
                  </div>

                  <form className='mt-8 space-y-6' onSubmit={saveClass}>
                    <input type='hidden' name='remember' value='true'></input>
                    <div className='rounded-md shadow-sm -space-y-px'>
                      <div>
                        <h1 className='text-white'>Class Name:</h1>
                        <label htmlFor='class-name' className='sr-only'>
                          Class Name
                        </label>
                        <input
                          onChange={e =>
                            setFormData({
                              ...formData,
                              classroomName: e.target.value,
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
                        <h1 className='text-white'>Description:</h1>
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
                    <div className='rounded-md shadow-sm -space-y-px w-60 lg:w-72 2xl:w-96'>
                      <div>
                        <h1 className='text-white'>Select Certifications:</h1>
                        <MultiSelect
                          hidePlaceholder={false}
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
                        Create
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
      </div>
    </>
  );
}
