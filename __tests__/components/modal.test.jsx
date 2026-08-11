import Modal from '../../components/modal';
import React from 'react';
import renderer from 'react-test-renderer';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

const sampleData = [
  {
    value: 0,
    label: '2022/responsive-web-design',
    displayName: 'Responsive Web Design'
  },
  {
    value: 1,
    label: 'scientific-computing-with-python',
    displayName: 'Scientific Computing with Python'
  },
  {
    value: 2,
    label: 'data-analysis-with-python',
    displayName: 'Data Analysis with Python'
  },
  {
    value: 3,
    label: 'machine-learning-with-python',
    displayName: 'Machine Learning with Python'
  },
  {
    value: 4,
    label: 'responsive-web-design',
    displayName: 'Legacy Responsive Web Design'
  }
];

const sampleUser = 'Ayomide';
const className =
  'flex cursor-pointer justify-center p-4 m-6 rounded-md hover:bg-fcc-primary-yellow shadedow-lg border-solid border-color: inherit; border-2 pl-4 pr-4 bg-[#feac32] text-black';

describe('Modal Component', () => {
  it('renders header correctly', () => {
    const tree = renderer
      .create(<Modal userId={sampleUser} certificationNames={sampleData} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  // The Create Class form renders through a React portal straight to
  // document.body (see components/ClassModal.js), so it's verified with
  // Testing Library against the real jsdom document instead of
  // react-test-renderer's toJSON(), which can't reconcile a portal target
  // that isn't one of its own fake instances.
  it('renders whole form after header clicked', () => {
    render(<Modal userId={sampleUser} certificationNames={sampleData} />);

    fireEvent.click(screen.getByText('Create Class'));

    expect(
      screen.getByText('Create Class', { selector: '.text-lg' })
    ).toBeVisible();
    expect(screen.getByLabelText('Class Name')).toBeVisible();
    expect(screen.getByLabelText('Description')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Create' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  it('closes the form when Cancel is clicked', () => {
    render(<Modal userId={sampleUser} certificationNames={sampleData} />);

    fireEvent.click(screen.getByText('Create Class'));
    expect(screen.getByRole('button', { name: 'Create' })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(
      screen.queryByRole('button', { name: 'Create' })
    ).not.toBeInTheDocument();
  });
});
