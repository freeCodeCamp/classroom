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

describe('Modal Component', () => {
  // Headless UI's Dialog (used by @freecodecamp/ui's Modal) needs
  // ResizeObserver, which jsdom doesn't implement. Stubbed the same way as
  // freeCodeCamp's own modal tests.
  beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
      observe = jest.fn();
      unobserve = jest.fn();
      disconnect = jest.fn();
    };
  });

  it('renders header correctly', () => {
    const tree = renderer
      .create(<Modal userId={sampleUser} certificationNames={sampleData} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  // The Create Class form renders in @freecodecamp/ui's Modal, which portals
  // to document.body, so it's verified with Testing Library against the real
  // jsdom document instead of react-test-renderer's toJSON().
  it('renders whole form after header clicked', () => {
    render(<Modal userId={sampleUser} certificationNames={sampleData} />);

    fireEvent.click(screen.getByRole('button', { name: 'Create Class' }));

    expect(screen.getByRole('dialog', { name: 'Create Class' })).toBeVisible();
    expect(screen.getByLabelText('Class Name')).toBeVisible();
    expect(screen.getByLabelText('Description')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Create' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  it('closes the form when Cancel is clicked', () => {
    render(<Modal userId={sampleUser} certificationNames={sampleData} />);

    fireEvent.click(screen.getByRole('button', { name: 'Create Class' }));
    expect(screen.getByRole('button', { name: 'Create' })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(
      screen.queryByRole('button', { name: 'Create' })
    ).not.toBeInTheDocument();
  });
});
