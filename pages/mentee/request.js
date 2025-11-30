// pages/mentee/request.js

import { useState } from 'react';

const SUBJECTS = [
  'DSA',
  'Web Development',
  'Python',
  'DBMS',
  'Operating Systems'
];

export default function MenteeRequest() {
  const [subjects, setSubjects] = useState([]);
  const [message, setMessage] = useState('');

  function toggleSubject(subj) {
    setSubjects(prev =>
      prev.includes(subj) ? prev.filter(s => s !== subj) : [...prev, subj]
    );
  }

  async function submit(e) {
    e.preventDefault();

    if (subjects.length === 0) {
      setMessage('❌ Please select at least one subject');
      return;
    }

    setMessage('Submitting...');

    const res = await fetch('/api/mentee/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjects })
    });

    const data = await res.json();

    if (res.ok) {
      setMessage('✔ Mentorship request submitted successfully!');
      setSubjects([]); // clear
    } else {
      setMessage(`❌ ${data.error}`);
    }
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Request a Mentor</h1>

      <form style={styles.card} onSubmit={submit}>
        <h2>Select Subjects</h2>

        <div style={styles.list}>
          {SUBJECTS.map(sub => (
            <label style={styles.item} key={sub}>
              <input
                type='checkbox'
                checked={subjects.includes(sub)}
                onChange={() => toggleSubject(sub)}
              />
              {sub}
            </label>
          ))}
        </div>

        <button style={styles.button} type='submit'>
          Submit Request
        </button>

        {message && <p style={styles.message}>{message}</p>}
      </form>
    </div>
  );
}

const styles = {
  page: {
    padding: '2rem',
    minHeight: '100vh',
    background: '#f4f4f9',
    fontFamily: 'Arial'
  },
  title: {
    textAlign: 'center',
    fontSize: '2rem',
    marginBottom: '1rem'
  },
  card: {
    background: '#fff',
    padding: '1.5rem',
    maxWidth: '600px',
    margin: 'auto',
    borderRadius: '10px',
    boxShadow: '0 2px 10px #0002'
  },
  list: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginTop: '15px'
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px',
    background: '#f8f9ff',
    borderRadius: '6px',
    border: '1px solid #e0e0e0'
  },
  button: {
    width: '100%',
    padding: '12px',
    marginTop: '20px',
    background: '#16a34a',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  message: {
    marginTop: '1rem',
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#4f46e5'
  }
};
