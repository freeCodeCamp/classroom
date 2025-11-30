// pages/mentorship/dashboard.js
import { useEffect, useState } from 'react';

export default function MentorshipDashboard() {
  const [mentors, setMentors] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [pairs, setPairs] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setMessage('Loading data...');

    const res = await fetch('/api/mentorship/overview');
    const data = await res.json();

    if (res.ok) {
      setMentors(data.mentors || []);
      setMentees(data.mentees || []);
      setPairs(data.pairs || []);
      setMessage('');
    } else {
      setMessage(`❌ ${data.error}`);
    }

    setLoading(false);
  }

  async function runMatch() {
    setMessage('Running matching...');

    const res = await fetch('/api/mentorship/match', { method: 'POST' });
    const data = await res.json();

    if (res.ok) {
      setMessage(
        `✔ Matching finished: ${data.createdPairsCount} new matches created`
      );
      load();
    } else {
      setMessage(`❌ ${data.error}`);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Teacher Mentorship Dashboard</h1>

      {/* Actions */}
      <div style={styles.actions}>
        <button style={styles.buttonGray} onClick={load}>
          Refresh
        </button>
        <button style={styles.buttonBlue} onClick={runMatch}>
          Run Matching
        </button>
      </div>

      {message && <p style={styles.message}>{message}</p>}

      {loading ? (
        <div style={styles.loading}>Loading...</div>
      ) : (
        <>
          <div style={styles.grid}>
            {/* Pending mentees */}
            <div style={styles.card}>
              <h2>Pending Mentees</h2>
              {mentees.filter(m => m.status === 'pending').length === 0 ? (
                <p>No pending requests</p>
              ) : (
                mentees
                  .filter(m => m.status === 'pending')
                  .map(m => (
                    <div key={m.id} style={styles.item}>
                      <strong>{m.user?.name || 'Student'}</strong>
                      <div style={styles.subText}>
                        Subjects: {m.subjects.join(', ')}
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* Mentors */}
            <div style={styles.card}>
              <h2>Mentors</h2>
              {mentors.length === 0 ? (
                <p>No mentors yet</p>
              ) : (
                mentors.map(mentor => {
                  const priorities = mentor.subjectPriorities || {};
                  return (
                    <div key={mentor.id} style={styles.item}>
                      <strong>{mentor.user?.name || 'Teacher'}</strong>
                      <div style={styles.subText}>
                        Subjects:
                        {mentor.subjects.map(s => (
                          <span key={s} style={styles.chip}>
                            {s} (p{priorities[s] ?? '-'})
                          </span>
                        ))}
                      </div>
                      <div style={styles.subText}>
                        Assigned mentees: {mentor.pairs?.length ?? 0}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Current matches */}
          <div style={styles.cardFull}>
            <h2>Current Matches</h2>
            {pairs.length === 0 ? (
              <p>No matches yet</p>
            ) : (
              pairs.map(p => (
                <div key={p.id} style={styles.item}>
                  <strong>{p.mentor.user?.name}</strong> →
                  <span style={styles.subText}> {p.mentee.user?.name}</span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ---------- inline styles ----------
const styles = {
  page: {
    padding: '2rem',
    background: '#f4f4f9',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif'
  },
  title: {
    textAlign: 'center',
    fontSize: '2rem',
    marginBottom: '1rem'
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  buttonGray: {
    padding: '10px 16px',
    borderRadius: '6px',
    background: '#6b7280',
    color: 'white',
    border: 'none',
    cursor: 'pointer'
  },
  buttonBlue: {
    padding: '10px 16px',
    borderRadius: '6px',
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    cursor: 'pointer'
  },
  message: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#4f46e5',
    marginBottom: '1rem'
  },
  loading: {
    textAlign: 'center',
    fontSize: '1.1rem',
    marginTop: '2rem'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },
  card: {
    background: '#ffffff',
    padding: '1rem',
    borderRadius: '10px',
    boxShadow: '0 2px 8px #0002'
  },
  cardFull: {
    background: '#ffffff',
    padding: '1rem',
    borderRadius: '10px',
    boxShadow: '0 2px 8px #0002',
    marginTop: '20px'
  },
  item: {
    padding: '10px 0',
    borderBottom: '1px solid #eee'
  },
  subText: {
    color: '#4b5563',
    fontSize: '0.9rem'
  },
  chip: {
    background: '#e0e7ff',
    padding: '3px 8px',
    borderRadius: '6px',
    marginLeft: '4px',
    fontSize: '0.85rem'
  }
};
