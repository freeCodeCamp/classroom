import ClassInviteTable from '../../components/ClassInviteTable';
import Head from 'next/head';
import Navbar from '../../components/navbar';
import { Callout } from '@freecodecamp/ui';
import { getSession } from 'next-auth/react';
import Modal from '../../components/modal';
import { getAllTitlesAndDashedNamesSuperblockJSONArray } from '../../util/curriculum/getAllTitlesAndDashedNamesSuperblockJSONArray';
import { useState } from 'react';
import redirectUser from '../../util/redirectUser.js';

export async function getServerSideProps(ctx) {
  // Dynamic import to prevent Prisma from being bundled for client
  const { default: prisma } = await import('../../prisma/prisma');

  const userSession = await getSession(ctx);
  if (!userSession) {
    return redirectUser('/error');
  }

  const userInfo = await prisma.User.findMany({
    where: {
      email: userSession['user']['email']
    }
  });
  if (userInfo[0].role == 'ADMIN') {
    return redirectUser('/admin');
  } else if (userInfo[0].role != 'TEACHER') {
    return redirectUser('/error');
  }

  const classrooms = await prisma.Classroom.findMany({
    where: {
      classroomTeacherId: userInfo[0].id
    }
  });
  const output = [];
  classrooms.map(classroom =>
    output.push({
      classroomName: classroom.classroomName,
      classroomId: classroom.classroomId,
      description: classroom.description,
      createdAt: JSON.stringify(classroom.createdAt),
      fccCertifications: classroom.fccCertifications
    })
  );

  let blocks = [];
  try {
    const superblocks = await getAllTitlesAndDashedNamesSuperblockJSONArray();
    blocks = superblocks.map(x => ({
      value: x.dashedName,
      label: x.dashedName,
      displayName: x.title
    }));
  } catch (error) {
    console.error('Unable to load certification options for /classes', error);
  }

  return {
    props: {
      userSession,
      classrooms: output,
      user: userInfo[0].id,
      certificationNames: blocks
    }
  };
}

export default function Classes({
  userSession,
  classrooms,
  user,
  certificationNames
}) {
  let [currentClassrooms, setCurrentClassrooms] = useState(classrooms);
  const handleDelete = classToDelete => {
    setCurrentClassrooms(currentClassrooms =>
      currentClassrooms.filter(
        currClass => currClass.classroomId != classToDelete
      )
    );
  };
  const handleEdit = (classToEditId, updatedData) => {
    const updatedClassrooms = currentClassrooms.map(currClass => {
      if (classToEditId == currClass.classroomId) {
        return {
          ...currClass,
          classroomName: updatedData.classroomName,
          description: updatedData.description,
          fccCertifications: updatedData.fccCertifications
        };
      }
      return currClass;
    });
    setCurrentClassrooms(updatedClassrooms);
  };

  return (
    <>
      <Head>
        <title>Your classes | freeCodeCamp Classroom</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>
      {userSession && (
        <>
          <Navbar />

          <div className='max-w-xl mx-auto px-4 pt-10 text-center'>
            <h1 className='big-heading'>Your classes</h1>
            <p className='mb-0'>
              Use a class&apos;s <strong>Actions</strong> menu to copy its
              invite link, edit it, or delete it.
            </p>
          </div>

          {
            <Modal
              userId={user}
              certificationNames={certificationNames}
              currentClassrooms={currentClassrooms}
              setCurrentClassrooms={setCurrentClassrooms}
            />
          }
          {currentClassrooms.length === 0 && (
            <div className='max-w-xl mx-auto px-4'>
              <Callout variant='note' label='No classes yet'>
                <p className='mb-0'>
                  Select <strong>Create Class</strong> to set up your first
                  class, then share its invite link with your students.
                </p>
              </Callout>
            </div>
          )}
          {currentClassrooms.map(classroom => (
            <div key={classroom.classroomId}>
              <ClassInviteTable
                currentClass={classroom}
                certificationNames={certificationNames}
                currentClassrooms={currentClassrooms}
                handleDelete={handleDelete}
                handleEdit={handleEdit}
                userId={user}
              ></ClassInviteTable>
            </div>
          ))}
        </>
      )}
    </>
  );
}
