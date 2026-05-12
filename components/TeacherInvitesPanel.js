import { useEffect, useState } from 'react';
import DisplayNotification from './displayNotification';
import { ToastContainer } from 'react-toastify';
import styles from './TeacherInvitesPanel.module.css';

const normalizeInvitedEmail = value => value.trim().toLowerCase();

const formatDate = value => {
  if (!value) {
    return 'N/A';
  }
  return new Date(value).toLocaleString();
};

export default function TeacherInvitesPanel() {
  const [invitedTeacherEmail, setInvitedTeacherEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [emailQuery, setEmailQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);

  const normalizedQuery = emailQuery.trim().toLowerCase();

  const visibleInvitations = invitations.filter(invitation => {
    const matchesEmail = normalizedQuery
      ? invitation.invitedTeacherEmail.toLowerCase().includes(normalizedQuery)
      : true;

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'ACTIVE'
          ? invitation.status !== 'ACCEPTED'
          : invitation.status === statusFilter;

    return matchesEmail && matchesStatus;
  });

  useEffect(() => {
    setPageIndex(0);
  }, [emailQuery, statusFilter, entriesPerPage]);

  const totalEntries = visibleInvitations.length;
  const paginatedInvitations = visibleInvitations.slice(
    pageIndex * entriesPerPage,
    (pageIndex + 1) * entriesPerPage
  );
  const startEntry = totalEntries === 0 ? 0 : pageIndex * entriesPerPage + 1;
  const endEntry = Math.min((pageIndex + 1) * entriesPerPage, totalEntries);

  const baseOptions = [10, 20, 50, 100];
  let entriesPerPageOptions = baseOptions.filter(
    option => option < totalEntries
  );
  if (totalEntries > 0 && totalEntries < 100) {
    entriesPerPageOptions.push(totalEntries);
  }
  if (entriesPerPageOptions.length === 0) {
    entriesPerPageOptions = [10];
  }

  const normalizedEntriesPerPageOptions = [
    ...new Set(entriesPerPageOptions)
  ].sort((first, second) => first - second);

  const canPreviousPage = pageIndex > 0;
  const canNextPage = endEntry < totalEntries;

  const goToLastPage = () => {
    const lastPageIndex = Math.max(
      0,
      Math.ceil(totalEntries / entriesPerPage) - 1
    );
    setPageIndex(lastPageIndex);
  };

  const loadInvitations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/teacher_invites/list?limit=100');
      if (!response.ok) {
        DisplayNotification('Error', 'Could not load teacher invitations.');
        return;
      }
      const data = await response.json();
      setInvitations(data.invitations || []);
    } catch {
      DisplayNotification('Error', 'Could not load teacher invitations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const createInvitation = async event => {
    event.preventDefault();
    const normalizedEmail = normalizeInvitedEmail(invitedTeacherEmail);

    if (!normalizedEmail) {
      DisplayNotification('Error', 'Please enter a teacher email.');
      return;
    }

    try {
      const response = await fetch('/api/admin/teacher_invites/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ invitedTeacherEmail: normalizedEmail })
      });

      if (response.status === 409) {
        DisplayNotification(
          'Error',
          'An active invite already exists for this teacher email.'
        );
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        DisplayNotification(
          'Error',
          data.error || 'Failed to create invitation.'
        );
        return;
      }

      setInvitedTeacherEmail('');
      DisplayNotification('Success', 'Teacher invitation created.');
      await loadInvitations();
    } catch {
      DisplayNotification('Error', 'Failed to create invitation.');
    }
  };

  const resendInvitation = async teacherInvitationId => {
    try {
      const response = await fetch('/api/admin/teacher_invites/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ teacherInvitationId })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        DisplayNotification(
          'Error',
          data.error || 'Failed to resend invitation.'
        );
        return;
      }

      DisplayNotification('Success', 'Invitation resent.');
      await loadInvitations();
    } catch {
      DisplayNotification('Error', 'Failed to resend invitation.');
    }
  };

  const revokeInvitation = async teacherInvitationId => {
    try {
      const response = await fetch('/api/admin/teacher_invites/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ teacherInvitationId })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        DisplayNotification(
          'Error',
          data.error || 'Failed to revoke invitation.'
        );
        return;
      }

      DisplayNotification('Success', 'Invitation revoked.');
      await loadInvitations();
    } catch {
      DisplayNotification('Error', 'Failed to revoke invitation.');
    }
  };

  return (
    <section className={styles.panel}>
      <ToastContainer />

      <form onSubmit={createInvitation} className={styles.form}>
        <input
          type='email'
          value={invitedTeacherEmail}
          onChange={event => setInvitedTeacherEmail(event.target.value)}
          className={styles.emailInput}
          placeholder='teacher@example.org'
          required
        />
        <button type='submit' className={styles.primaryButton}>
          Send Invite
        </button>
      </form>

      <div className={styles.controlsRow}>
        <label className={styles.controlLabel}>
          Search email:
          <input
            type='search'
            value={emailQuery}
            onChange={event => setEmailQuery(event.target.value)}
            className={styles.filterInput}
            placeholder='teacher@example.org'
            aria-label='Search invitations by email'
          />
        </label>
        <label className={styles.controlLabel}>
          Status:
          <select
            value={statusFilter}
            onChange={event => setStatusFilter(event.target.value)}
            className={styles.filterSelect}
            aria-label='Filter invitations by status'
          >
            <option value='ACTIVE'>Active (hide accepted)</option>
            <option value='ALL'>All statuses</option>
            <option value='PENDING'>Pending</option>
            <option value='ACCEPTED'>Accepted</option>
            <option value='REVOKED'>Revoked</option>
            <option value='EXPIRED'>Expired</option>
          </select>
        </label>
        <span className={styles.paginationInfo}>Showing {totalEntries}</span>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.headerRow}>
              <th className={styles.headerCell}>Email</th>
              <th className={styles.headerCell}>Status</th>
              <th className={styles.headerCell}>Expires</th>
              <th className={styles.headerCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className={styles.cell} colSpan='4'>
                  Loading invitations...
                </td>
              </tr>
            ) : totalEntries === 0 ? (
              <tr>
                <td className={styles.cell} colSpan='4'>
                  No invitations match the current filters.
                </td>
              </tr>
            ) : (
              paginatedInvitations.map(invitation => (
                <tr key={invitation.teacherInvitationId} className={styles.row}>
                  <td className={styles.cell}>
                    {invitation.invitedTeacherEmail}
                  </td>
                  <td className={styles.cell}>{invitation.status}</td>
                  <td className={styles.cell}>
                    {formatDate(invitation.expiresAt)}
                  </td>
                  <td className={styles.cell}>
                    <div className={styles.actionGroup}>
                      <button
                        type='button'
                        className={styles.secondaryButton}
                        onClick={() =>
                          resendInvitation(invitation.teacherInvitationId)
                        }
                        disabled={invitation.status === 'ACCEPTED'}
                      >
                        Resend
                      </button>
                      <button
                        type='button'
                        className={styles.secondaryButton}
                        onClick={() =>
                          revokeInvitation(invitation.teacherInvitationId)
                        }
                        disabled={invitation.status !== 'PENDING'}
                      >
                        Revoke
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan='4' className={styles.footer}>
                <div className={styles.paginationContainer}>
                  <label>
                    Rows per page:
                    <select
                      value={entriesPerPage}
                      onChange={event =>
                        setEntriesPerPage(Number(event.target.value))
                      }
                    >
                      {normalizedEntriesPerPageOptions.map(option => (
                        <option value={option} key={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <span className={styles.paginationInfo}>
                    {startEntry}-{endEntry} of {totalEntries}
                  </span>
                  <button
                    onClick={() => setPageIndex(0)}
                    disabled={!canPreviousPage}
                    className={`${styles.paginationButton} ${
                      !canPreviousPage
                        ? styles.paginationButtonDisabled
                        : styles.paginationButtonEnabled
                    }`}
                  >
                    |<b>&lt;</b>
                  </button>
                  <button
                    onClick={() => setPageIndex(currentPage => currentPage - 1)}
                    disabled={!canPreviousPage}
                    className={`${styles.paginationButton} ${
                      !canPreviousPage
                        ? styles.paginationButtonDisabled
                        : styles.paginationButtonEnabled
                    }`}
                  >
                    <b>&lt;</b>
                  </button>
                  <button
                    onClick={() => setPageIndex(currentPage => currentPage + 1)}
                    disabled={!canNextPage}
                    className={`${styles.paginationButton} ${
                      !canNextPage
                        ? styles.paginationButtonDisabled
                        : styles.paginationButtonEnabled
                    }`}
                  >
                    <b>&gt;</b>
                  </button>
                  <button
                    onClick={goToLastPage}
                    disabled={!canNextPage}
                    className={`${styles.paginationButton} ${
                      !canNextPage
                        ? styles.paginationButtonDisabled
                        : styles.paginationButtonEnabled
                    }`}
                  >
                    <b>&gt;</b>|
                  </button>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
