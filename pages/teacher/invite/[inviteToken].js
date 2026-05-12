import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { getSession, signIn } from 'next-auth/react';

export async function getServerSideProps(ctx) {
  const { inviteToken } = ctx.params;
  const userSession = await getSession(ctx);

  return {
    props: {
      inviteToken,
      userSession: userSession || null
    }
  };
}

export default function TeacherInviteAccept({ inviteToken, userSession }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleAcceptInvite = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/teacher_invites/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inviteToken
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Map specific error cases
        if (data.error === 'Invitation expired') {
          setError(
            'This invitation has expired. Please ask your admin for a new one.'
          );
        } else if (data.error === 'Invitation revoked') {
          setError(
            'This invitation has been revoked. Please contact your admin.'
          );
        } else if (data.error?.includes('email mismatch')) {
          setError(
            'This invitation is for a different email address. Please sign in with the correct email.'
          );
        } else {
          setError(data.error || 'Failed to accept invitation');
        }
        return;
      }

      setSuccess(true);
      // Redirect after success
      setTimeout(() => {
        router.push('/admin');
      }, 2000);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Error accepting invite:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    await signIn('auth0');
  };

  return (
    <>
      <Head>
        <title>Accept Teacher Invitation - freeCodeCamp Classroom</title>
        <meta
          name='description'
          content='Accept your teacher invitation to join freeCodeCamp Classroom'
        />
      </Head>

      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5'
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            maxWidth: '500px',
            width: '100%',
            margin: '20px'
          }}
        >
          {!userSession ? (
            <>
              <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
                Welcome to freeCodeCamp Classroom!
              </h1>
              <p style={{ textAlign: 'center', marginBottom: '30px' }}>
                You&apos;ve been invited to join as a teacher. Sign in to accept
                your invitation.
              </p>
              <button
                onClick={handleSignIn}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0891b2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Sign In with Auth0
              </button>
            </>
          ) : success ? (
            <>
              <h1
                style={{
                  textAlign: 'center',
                  color: '#059669',
                  marginBottom: '20px'
                }}
              >
                ✓ Invitation Accepted!
              </h1>
              <p style={{ textAlign: 'center', marginBottom: '30px' }}>
                Welcome to freeCodeCamp Classroom! You&apos;re now a teacher.
                Redirecting...
              </p>
            </>
          ) : (
            <>
              <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
                Accept Your Invitation
              </h1>
              <div
                style={{
                  backgroundColor: '#f0f9ff',
                  padding: '15px',
                  borderRadius: '5px',
                  marginBottom: '20px',
                  borderLeft: '4px solid #0891b2'
                }}
              >
                <p style={{ margin: '0', fontSize: '14px' }}>
                  <strong>Signed in as:</strong> {userSession.user.email}
                </p>
              </div>

              {error && (
                <div
                  style={{
                    backgroundColor: '#fee',
                    padding: '15px',
                    borderRadius: '5px',
                    marginBottom: '20px',
                    color: '#c00',
                    borderLeft: '4px solid #f00'
                  }}
                >
                  {error}
                </div>
              )}

              {!error && (
                <p
                  style={{
                    marginBottom: '30px',
                    textAlign: 'center',
                    color: '#666'
                  }}
                >
                  Click the button below to accept your invitation and become a
                  teacher.
                </p>
              )}

              <button
                onClick={handleAcceptInvite}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: loading ? '#ccc' : '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '16px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {loading ? 'Accepting...' : 'Accept Invitation'}
              </button>

              {error && (
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <button
                    onClick={handleSignIn}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#0891b2',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Sign In with Different Account
                  </button>
                </div>
              )}
            </>
          )}

          <div
            style={{
              marginTop: '30px',
              textAlign: 'center',
              fontSize: '14px',
              color: '#666'
            }}
          >
            <Link href='/' style={{ color: '#0891b2', textDecoration: 'none' }}>
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
