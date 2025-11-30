import Modal from '../../components/modal';
import React from 'react';
import renderer, { act } from 'react-test-renderer';

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
  it('renders whole form after header clicked', () => {
    const testRenderer = renderer.create(
      <Modal userId={sampleUser} certificationNames={sampleData} />
    );
    const testInstance = testRenderer.root;
    const header = testInstance.findByProps({ className });
    act(() => {
      header.props.onClick();
    });
    const tree = testRenderer.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
