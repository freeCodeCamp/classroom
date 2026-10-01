import ClassInviteTable from '../../components/ClassInviteTable';
import React from 'react';
import renderer from 'react-test-renderer';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

  it('opens the Actions menu with Edit, Copy invite link and Delete', () => {
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

    fireEvent.click(screen.getByRole('button', { name: 'Actions' }));

    expect(
      screen.getAllByRole('menuitem').map(item => item.textContent)
    ).toEqual(['Edit', 'Copy invite link', 'Delete']);
  });

  it('describes the certification button with the class certifications', () => {
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

    const tooltip = screen.getByRole('tooltip', { hidden: true });
    expect(
      screen.getByRole('button', {
        name: 'Show certifications in this class'
      })
    ).toHaveAttribute('aria-describedby', tooltip.id);
  });

  describe('deleting a class', () => {
    afterEach(() => {
      delete global.fetch;
    });

    const openDeleteConfirmation = handleDelete => {
      render(
        <ClassInviteTable
          currentClass={sampleClassroom}
          certificationNames={certifications}
          currentClassrooms={sampleCurrentClassrooms}
          handleDelete={handleDelete}
          handleEdit={() => {}}
          userId={userId}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
      fireEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));
    };

    it('asks for confirmation in a dialog before deleting', () => {
      global.fetch = jest.fn();
      openDeleteConfirmation(jest.fn());

      expect(
        screen.getByRole('dialog', { name: 'Delete class?' })
      ).toBeVisible();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('removes the class after the server confirms the delete', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 });
      const handleDelete = jest.fn();
      openDeleteConfirmation(handleDelete);

      fireEvent.click(screen.getByRole('button', { name: 'Delete class' }));

      await waitFor(() =>
        expect(handleDelete).toHaveBeenCalledWith(sampleClassroom.classroomId)
      );
    });

    // Regression test: any non-403 failure used to be reported as a
    // successful delete and removed the card.
    it('keeps the class when the server fails to delete it', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });
      const handleDelete = jest.fn();
      openDeleteConfirmation(handleDelete);

      fireEvent.click(screen.getByRole('button', { name: 'Delete class' }));

      await waitFor(() => expect(global.fetch).toHaveBeenCalled());
      expect(handleDelete).not.toHaveBeenCalled();
    });
  });

  describe('editing a class', () => {
    afterEach(() => {
      delete global.fetch;
    });

    // Certification options in the shape pages/classes builds for the modal,
    // with a class whose stored certifications match them.
    const certificationOptions = [
      {
        value: 'responsive-web-design',
        label: 'responsive-web-design',
        displayName: 'Responsive Web Design'
      },
      {
        value: 'relational-databases',
        label: 'relational-databases',
        displayName: 'Relational Databases'
      }
    ];
    const classWithCerts = {
      ...sampleClassroom,
      fccCertifications: ['responsive-web-design']
    };

    const openEdit = () => {
      render(
        <ClassInviteTable
          currentClass={classWithCerts}
          certificationNames={certificationOptions}
          currentClassrooms={sampleCurrentClassrooms}
          handleDelete={() => {}}
          handleEdit={jest.fn()}
          userId={userId}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
      fireEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));
    };

    // Regression test: the pre-filled form used to send every field, so the
    // API never saw "no changes" and always reported the class as updated.
    it('does not call the API when nothing was changed', async () => {
      global.fetch = jest.fn();
      openEdit();

      fireEvent.click(screen.getByRole('button', { name: 'Update' }));

      await waitFor(() =>
        expect(
          screen.queryByRole('dialog', { name: 'Edit Class' })
        ).not.toBeInTheDocument()
      );
      expect(global.fetch).not.toHaveBeenCalled();
    });

    // Regression test: the new name used to be sent as a key the API ignored.
    it('sends only the changed name, as classroomName', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ ...classWithCerts, classroomName: 'Renamed' })
      });
      openEdit();

      fireEvent.change(screen.getByLabelText('Class Name'), {
        target: { value: 'Renamed' }
      });
      fireEvent.click(screen.getByRole('button', { name: 'Update' }));

      await waitFor(() => expect(global.fetch).toHaveBeenCalled());
      expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({
        classroomId: sampleClassroom.classroomId,
        classroomName: 'Renamed'
      });
    });

    it('closes the modal once the update succeeds', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ ...classWithCerts, classroomName: 'Renamed' })
      });
      openEdit();

      fireEvent.change(screen.getByLabelText('Class Name'), {
        target: { value: 'Renamed' }
      });
      fireEvent.click(screen.getByRole('button', { name: 'Update' }));

      await waitFor(() =>
        expect(
          screen.queryByRole('dialog', { name: 'Edit Class' })
        ).not.toBeInTheDocument()
      );
    });

    // A failed save used to close the modal and throw away the edits.
    it('keeps the modal open with the edits when the update fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });
      openEdit();

      fireEvent.change(screen.getByLabelText('Class Name'), {
        target: { value: 'Renamed' }
      });
      fireEvent.click(screen.getByRole('button', { name: 'Update' }));

      await waitFor(() => expect(global.fetch).toHaveBeenCalled());
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Update' })).toBeEnabled()
      );
      expect(
        screen.getByRole('dialog', { name: 'Edit Class' })
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Class Name')).toHaveValue('Renamed');
    });

    it('keeps the modal open when the request throws', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('offline'));
      openEdit();

      fireEvent.change(screen.getByLabelText('Class Name'), {
        target: { value: 'Renamed' }
      });
      fireEvent.click(screen.getByRole('button', { name: 'Update' }));

      await waitFor(() => expect(global.fetch).toHaveBeenCalled());
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Update' })).toBeEnabled()
      );
      expect(
        screen.getByRole('dialog', { name: 'Edit Class' })
      ).toBeInTheDocument();
    });
  });

  it('does not throw when the clipboard is unavailable', async () => {
    const writeText = jest.fn().mockRejectedValue(new Error('denied'));
    Object.assign(navigator, { clipboard: { writeText } });
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

    fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Copy invite link' }));

    await waitFor(() => expect(writeText).toHaveBeenCalled());
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

    fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));

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

    fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));

    expect(screen.getByText('Edit Class')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Update' })).toBeVisible();
  });
});
