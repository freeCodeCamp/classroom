import ClassInviteTable from '../../components/ClassInviteTable';
import React from 'react';
import renderer from 'react-test-renderer';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  certifications,
  classroomId,
  userId
} from '../../testing_data/testing-data';

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    reload: jest.fn(),
    query: {},
    pathname: '/',
    asPath: '/'
  }))
}));

const sampleCurrentClassrooms = [
  {
    classroomName: 'how to build a website',
    description: 'learn how to build a website in a jiffy ',
    classroomId,
    createdAt: JSON.stringify(new Date('4/7/2019')),
    fccCertifications: [1, 2]
  },
  {
    classroomName: 'responsive website',
    description: 'make a website responsive ',
    classroomId,
    createdAt: JSON.stringify(new Date('9/12/2022')),
    fccCertifications: [4, 1]
  },
  {
    classroomName: 'javascript in a nutshell',
    description: 'add interactions with javascript',
    classroomId,
    createdAt: JSON.stringify(new Date('21/4/2023')),
    fccCertifications: [3, 2]
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

  // Regression test for the Edit Class modal pre-fill bug: the current name
  // and description used to only be set as `placeholder`, so the fields
  // looked pre-filled but any keystroke replaced them outright. They should
  // now be bound as the controlled `value`.
  it('pre-fills the Edit Class form with the current name and description', () => {
    render(
      <ClassInviteTable
        currentClass={sampleClassroom}
        certificationNames={certifications}
        currentClassrooms={sampleCurrentClassrooms}
        handleDelete={() => {}}
        handleEdit={() => {}}
        userId={userId}
      />
    );

    fireEvent.click(document.getElementById('menu-button'));
    fireEvent.click(screen.getByText('Edit'));

    expect(screen.getByLabelText('Class Name')).toHaveValue(
      sampleClassroom.classroomName
    );
    expect(screen.getByLabelText('Description')).toHaveValue(
      sampleClassroom.description
    );

    // Editing should append to the pre-filled value, not replace a blank field.
    fireEvent.change(screen.getByLabelText('Class Name'), {
      target: { value: `${sampleClassroom.classroomName} (updated)` }
    });
    expect(screen.getByLabelText('Class Name')).toHaveValue(
      `${sampleClassroom.classroomName} (updated)`
    );
  });

  it('renders the Edit Class modal into document.body via a portal', () => {
    render(
      <ClassInviteTable
        currentClass={sampleClassroom}
        certificationNames={certifications}
        currentClassrooms={sampleCurrentClassrooms}
        handleDelete={() => {}}
        handleEdit={() => {}}
        userId={userId}
      />
    );

    fireEvent.click(document.getElementById('menu-button'));
    fireEvent.click(screen.getByText('Edit'));

    expect(screen.getByText('Edit Class')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Update' })).toBeVisible();
  });
});
