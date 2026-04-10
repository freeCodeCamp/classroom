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
        DisplayNotification('Error', 'Failed to create invitation.');
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
      <h2 className={styles.title}>Teacher Invitations</h2>
      <p className={styles.description}>
        Invite a teacher by email. Use resend or revoke while invitation is
        pending.
      </p>

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
            ) : invitations.length === 0 ? (
              <tr>
                <td className={styles.cell} colSpan='4'>
                  No invitations yet.
                </td>
              </tr>
            ) : (
              invitations.map(invitation => (
                <tr key={invitation.teacherInvitationId}>
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
        </table>
      </div>
    </section>
  );
}
