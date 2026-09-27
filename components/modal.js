import { useState } from 'react';
import { Button } from '@freecodecamp/ui';
import ClassModal from './ClassModal';
import DisplayNotification from './displayNotification';

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
        <div className='flex justify-center'>
          <Button size='large' className='btn-cta m-6' onClick={clicked}>
            Create Class
          </Button>
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
