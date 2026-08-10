import { useState } from 'react';
import ClassModal from './ClassModal';
import DisplayNotification from './displayNotification';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Modal({
  userId,
  certificationNames,
  setCurrentClassrooms
}) {
  const [modalOn, setModalOn] = useState(false);

  const clicked = () => {
    setModalOn(true);
  };
  const closeModal = () => {
    setModalOn(false);
  };

  const createClass = async payload => {
    const response = await fetch(`/api/create_class_teacher`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      let jsonRes = await response.json();
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
      DisplayNotification('Success', 'Class Created!');
    } else {
      DisplayNotification('Error', 'Class could not be created!');
    }
  };

  return (
    <>
      <div>
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
        <ClassModal
          mode='create'
          isOpen={modalOn}
          onClose={closeModal}
          userId={userId}
          certificationNames={certificationNames}
          onSubmit={createClass}
        />
      </div>
    </>
  );
}
