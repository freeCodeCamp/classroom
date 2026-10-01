import Modal from '../../components/modal';
import React from 'react';
import renderer from 'react-test-renderer';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

  describe('submitting', () => {
    afterEach(() => {
      delete global.fetch;
    });

    const fillAndSubmit = () => {
      render(
        <Modal
          userId={sampleUser}
          certificationNames={sampleData}
          setCurrentClassrooms={jest.fn()}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Create Class' }));
      fireEvent.change(screen.getByLabelText('Class Name'), {
        target: { value: 'Period 3' }
      });
      fireEvent.change(screen.getByLabelText('Description'), {
        target: { value: 'Web dev' }
      });
      fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    };

    it('closes once the class is created', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ classroomName: 'Period 3', classroomId: 'c1' })
      });
      fillAndSubmit();

      await waitFor(() =>
        expect(
          screen.queryByRole('dialog', { name: 'Create Class' })
        ).not.toBeInTheDocument()
      );
    });

    // A failed create used to close the modal and lose what was typed.
    it('stays open with the input when the create fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });
      fillAndSubmit();

      await waitFor(() => expect(global.fetch).toHaveBeenCalled());
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled()
      );
      expect(
        screen.getByRole('dialog', { name: 'Create Class' })
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Class Name')).toHaveValue('Period 3');
    });

    it('stays open when the request throws', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('offline'));
      fillAndSubmit();

      await waitFor(() => expect(global.fetch).toHaveBeenCalled());
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled()
      );
      expect(
        screen.getByRole('dialog', { name: 'Create Class' })
      ).toBeInTheDocument();
    });
  });
});
