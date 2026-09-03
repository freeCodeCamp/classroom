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
  'flex cursor-pointer justify-center p-4 m-6 rounded-md shadow-lg border-solid border-[3px] border-[#feac32] bg-gradient-to-b from-[#fecc4c] to-[#ffac33] text-black text-[1.1rem] font-semibold hover:from-[#fecc4c] hover:to-[#fecc4c] hover:border-[#f1a02a]';

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
