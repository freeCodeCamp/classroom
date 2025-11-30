import { useState } from 'react';
import { useRouter } from 'next/router';

const SUBJECTS = [
  'DSA',
  'Web Development',
  'Python',
  'DBMS',
  'Operating Systems'
];

export default function MentorSetup() {
  const [subjects, setSubjects] = useState([]);
  const [priorities, setPriorities] = useState({});
  const [about, setAbout] = useState('');
  const [msg, setMsg] = useState('');

  const router = useRouter();

  function toggle(sub) {
    setSubjects(prev =>
      prev.includes(sub) ? prev.filter(x => x !== sub) : [...prev, sub]
    );
  }

  const setPriority = (subj, val) => {
    setPriorities(p => ({ ...p, [subj]: Number(val) }));
  };

  async function submit(e) {
    e.preventDefault();
    setMsg('Saving...');

    const res = await fetch('/api/mentor/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjects, priorities, about })
    });

    const data = await res.json();

    setMsg(res.ok ? 'Mentor profile saved!' : data.error);

    if (res.ok) setTimeout(() => router.push('/mentorship/dashboard'), 1000);
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Mentor Profile Setup</h1>

      <form onSubmit={submit} style={styles.card}>
        <h3>Select Subjects You Want to Teach:</h3>
        <div style={styles.grid}>
          {SUBJECTS.map(sub => (
            <div style={styles.item} key={sub}>
              <input
                type='checkbox'
                checked={subjects.includes(sub)}
                onChange={() => toggle(sub)}
              />
              {sub}

              {subjects.includes(sub) && (
                <input
                  style={styles.priority}
                  type='number'
                  min='1'
                  max='5'
                  placeholder='Priority 1-5'
                  onChange={e => setPriority(sub, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        <h3 style={{ marginTop: '20px' }}>About You</h3>
        <textarea
          value={about}
          onChange={e => setAbout(e.target.value)}
          style={styles.textarea}
          placeholder='Write a short introduction...'
        />

        <button type='submit' style={styles.button}>
          Save Mentor Profile
        </button>

        {msg && <p style={styles.msg}>{msg}</p>}
      </form>
    </div>
  );
}

const styles = {
  page: {
    padding: '2rem',
    background: '#f4f4f9',
    minHeight: '100vh',
    fontFamily: 'Arial'
  },
  title: { fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' },
  card: {
    background: '#fff',
    padding: '1.5rem',
    maxWidth: '650px',
    margin: 'auto',
    borderRadius: '10px',
    boxShadow: '0 2px 10px #0002'
  },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  item: { display: 'flex', alignItems: 'center', gap: '7px' },
  priority: { width: '60px', padding: '4px' },
  textarea: {
    width: '100%',
    height: '80px',
    padding: '10px',
    marginTop: '8px'
  },
  button: {
    marginTop: '15px',
    padding: '10px 15px',
    background: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    width: '100%',
    fontSize: '1rem'
  },
  msg: { marginTop: '15px', textAlign: 'center', color: '#4f46e5' }
};
