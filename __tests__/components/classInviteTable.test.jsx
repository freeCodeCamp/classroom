import ClassInviteTable from '../../components/ClassInviteTable';
import React from 'react';
import renderer from 'react-test-renderer';
import {
  certifications,
  classroomId,
  userId
} from '../../testing_data/testing-data';

const sampleCurrentClassrooms = [
  {
    classroomName: 'how to build a website',
    description: 'learn how to build a website in a jiffy ',
    classroomId,
    createdAt: JSON.stringify(new Date('4/7/2019')),
    fccCertifications: ['javascript-v9', 'python-v9']
  },
  {
    classroomName: 'responsive website',
    description: 'make a website responsive ',
    classroomId,
    createdAt: JSON.stringify(new Date('9/12/2022')),
    fccCertifications: ['relational-databases-v9', 'javascript-v9']
  },
  {
    classroomName: 'javascript in a nutshell',
    description: 'add interactions with javascript',
    classroomId,
    createdAt: JSON.stringify(new Date('21/4/2023')),
    fccCertifications: ['frontend-development-libraries-v9', 'python-v9']
  }
];
const sampleClassroom = sampleCurrentClassrooms[0];

describe('ClassInviteTable', () => {
  it('displays invites in a table', () => {
    const tree = renderer
      .create(
        <ClassInviteTable
          currentClass={sampleClassroom}
          certificationNames={certifications}
          currentClassrooms={sampleCurrentClassrooms}
          handleDelete={() => {}}
          handleEdit={() => {}}
          userId={userId}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
