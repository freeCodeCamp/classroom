import { fireEvent, render, screen } from '@testing-library/react';
import TeacherInvitesPanel from '../../components/TeacherInvitesPanel';
import type { TeacherInvitationListItem } from '../../types/invite';

vi.mock('../../components/displayNotification', () => ({ default: vi.fn() }));

// 25 pending invitations: teacher01@example.org to teacher25@example.org.
const invitations: TeacherInvitationListItem[] = Array.from(
  { length: 25 },
  (_, i) => ({
    teacherInvitationId: `invite-${i + 1}`,
    invitedTeacherEmail: `teacher${String(i + 1).padStart(2, '0')}@example.org`,
    status: 'PENDING',
    expiresAt: '2030-01-01T00:00:00.000Z'
  })
);

const renderOnSecondPage = async () => {
  render(<TeacherInvitesPanel />);
  await screen.findByText('teacher01@example.org');
  fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
  expect(screen.getByText('teacher11@example.org')).toBeInTheDocument();
  expect(screen.queryByText('teacher01@example.org')).not.toBeInTheDocument();
};

describe('TeacherInvitesPanel', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ invitations })
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(global, 'fetch');
  });

  it('goes back to the first page when the email search changes', async () => {
    await renderOnSecondPage();

    // Matches teacher10 to teacher19: ten results, so only one page.
    fireEvent.change(screen.getByLabelText('Search email'), {
      target: { value: 'teacher1' }
    });

    expect(screen.getByText('teacher10@example.org')).toBeInTheDocument();
  });

  it('goes back to the first page when the status filter changes', async () => {
    await renderOnSecondPage();

    fireEvent.change(screen.getByLabelText('Status'), {
      target: { value: 'ALL' }
    });

    expect(screen.getByText('teacher01@example.org')).toBeInTheDocument();
  });

  it('goes back to the first page when the page size changes', async () => {
    await renderOnSecondPage();

    fireEvent.change(screen.getByLabelText('Rows per page'), {
      target: { value: '20' }
    });

    expect(screen.getByText('teacher01@example.org')).toBeInTheDocument();
    expect(screen.getByText('teacher20@example.org')).toBeInTheDocument();
  });
});
