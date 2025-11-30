import { useState, useEffect } from 'react';

export default function MentorDashboard() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('');
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    // ✅ Fetch logged-in user info from your auth session (mocked for now)
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        setUser(data?.user);
        setRole(data?.user?.role); // teacher or student
      });
  }, []);

  const registerAsMentor = async skills => {
    await fetch('/api/mentor/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, skills })
    });
    alert('Mentor registered!');
  };

  const registerAsMentee = async interests => {
    await fetch('/api/mentee/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, interests })
    });
    alert('Mentee registered!');
  };

  const createMatch = async () => {
    const res = await fetch('/api/matches/create', { method: 'POST' });
    const data = await res.json();
    setMatches([...matches, data]);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Mentor–Mentee Dashboard</h1>

      {!user && <p>Loading user info...</p>}

      {role === 'teacher' && (
        <div>
          <h2>Register as Mentor</h2>
          <input id='skills' placeholder='Skills (comma-separated)' />
          <button
            onClick={() =>
              registerAsMentor(document.getElementById('skills').value)
            }
          >
            Register
          </button>
        </div>
      )}

      {role === 'student' && (
        <div>
          <h2>Register as Mentee</h2>
          <input id='interests' placeholder='Interests (comma-separated)' />
          <button
            onClick={() =>
              registerAsMentee(document.getElementById('interests').value)
            }
          >
            Register
          </button>
        </div>
      )}

      {role === 'teacher' && (
        <div style={{ marginTop: '20px' }}>
          <h2>Create Random Match</h2>
          <button onClick={createMatch}>Create</button>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <h3>Matches</h3>
        {matches.length === 0 ? (
          <p>No matches yet</p>
        ) : (
          <pre>{JSON.stringify(matches, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}
