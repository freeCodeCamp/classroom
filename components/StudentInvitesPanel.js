import { useCallback, useEffect, useState } from 'react';
import DisplayNotification from './displayNotification';
import styles from './StudentInvitesPanel.module.css';

const formatDate = value => {
  if (!value) {
    return 'N/A';
  }
  return new Date(value).toLocaleString();
};

const normalizeEmail = value => value.trim().toLowerCase();

export default function StudentInvitesPanel({ classroomId }) {
  const [invitedStudentEmail, setInvitedStudentEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [invitations, setInvitations] = useState([]);

  const loadInvitations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/student_invites/list?classroomId=${encodeURIComponent(
          classroomId
        )}&limit=100`
      );

      if (!response.ok) {
        DisplayNotification('Error', 'Could not load student invitations.');
        return;
      }

      const data = await response.json();
      setInvitations(data.invitations || []);
    } catch {
      DisplayNotification('Error', 'Could not load student invitations.');
    } finally {
      setIsLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    if (classroomId) {
      loadInvitations();
    }
  }, [classroomId, loadInvitations]);

  const createInvite = async event => {
    event.preventDefault();
    const email = normalizeEmail(invitedStudentEmail);

    if (!email) {
      DisplayNotification('Error', 'Please enter a student email.');
      return;
    }

    try {
      const response = await fetch('/api/student_invites/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          invitedStudentEmail: email,
          classroomId
        })
      });

      if (response.status === 409) {
        DisplayNotification(
          'Error',
          'An active invitation already exists for this student in this class.'
        );
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        DisplayNotification(
          'Error',
          data.error || 'Could not create student invitation.'
        );
        return;
      }

      setInvitedStudentEmail('');
      DisplayNotification('Success', 'Student invitation created.');
      await loadInvitations();
    } catch {
      DisplayNotification('Error', 'Could not create student invitation.');
    }
  };

  const resendInvite = async studentInvitationId => {
    try {
      const response = await fetch('/api/student_invites/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ studentInvitationId })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        DisplayNotification(
          'Error',
          data.error || 'Could not resend student invitation.'
        );
        return;
      }

      DisplayNotification('Success', 'Student invitation resent.');
      await loadInvitations();
    } catch {
      DisplayNotification('Error', 'Could not resend student invitation.');
    }
  };

  const revokeInvite = async studentInvitationId => {
    try {
      const response = await fetch('/api/student_invites/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ studentInvitationId })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        DisplayNotification(
          'Error',
          data.error || 'Could not revoke student invitation.'
        );
        return;
      }

      DisplayNotification('Success', 'Student invitation revoked.');
      await loadInvitations();
    } catch {
      DisplayNotification('Error', 'Could not revoke student invitation.');
    }
  };

  return (
    <section className={styles.panel}>
      <h3 className={styles.title}>Student Email Invitations</h3>
      <p className={styles.subtitle}>
        Send, resend, and revoke student invites for this class.
      </p>

      <form onSubmit={createInvite} className={styles.formRow}>
        <input
          type='email'
          value={invitedStudentEmail}
          onChange={event => setInvitedStudentEmail(event.target.value)}
          className={styles.input}
          placeholder='student@example.org'
          required
        />
        <button type='submit' className={styles.primaryButton}>
          Send Invite
        </button>
      </form>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Status</th>
              <th>Expires</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className={styles.emptyRow} colSpan='4'>
                  Loading invitations...
                </td>
              </tr>
            ) : invitations.length === 0 ? (
              <tr>
                <td className={styles.emptyRow} colSpan='4'>
                  No student invitations yet.
                </td>
              </tr>
            ) : (
              invitations.map(invitation => (
                <tr key={invitation.studentInvitationId}>
                  <td>{invitation.invitedStudentEmail}</td>
                  <td>{invitation.status}</td>
                  <td>{formatDate(invitation.expiresAt)}</td>
                  <td>
                    <div className={styles.actionGroup}>
                      <button
                        type='button'
                        className={styles.secondaryButton}
                        onClick={() =>
                          resendInvite(invitation.studentInvitationId)
                        }
                        disabled={invitation.status === 'ACCEPTED'}
                      >
                        Resend
                      </button>
                      <button
                        type='button'
                        className={styles.secondaryButton}
                        onClick={() =>
                          revokeInvite(invitation.studentInvitationId)
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
