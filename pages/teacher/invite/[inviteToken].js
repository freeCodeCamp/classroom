import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { getSession, signIn } from 'next-auth/react';
import styles from './TeacherInviteAccept.module.css';

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
  const [redirectPath, setRedirectPath] = useState('/classes');

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

      const nextPath = data?.user?.role === 'ADMIN' ? '/admin' : '/classes';
      setRedirectPath(nextPath);
      setSuccess(true);
      // Redirect after success
      setTimeout(() => {
        router.push(nextPath);
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

  const successDestinationLabel =
    redirectPath === '/admin'
      ? 'Continue to freeCodeCamp Classroom ->'
      : 'Continue to freeCodeCamp Classroom ->';

  return (
    <>
      <Head>
        <title>Accept Teacher Invitation - freeCodeCamp Classroom</title>
        <meta
          name='description'
          content='Accept your teacher invitation to join freeCodeCamp Classroom'
        />
      </Head>

      <main className={styles.page}>
        <div className={styles.shell}>
          <section className={styles.card}>
            <div className={styles.header}>
              <p className={styles.eyebrow}>freeCodeCamp Classroom</p>
              <h1 className={styles.title}>Teacher Invitation</h1>
              <p className={styles.subtitle}>
                Accept your teacher invitation and continue into the Classroom
                experience with your invited freeCodeCamp account.
              </p>
            </div>

            <div className={styles.body}>
              {!userSession ? (
                <>
                  <p className={styles.copy}>
                    You&apos;ve been invited to join freeCodeCamp Classroom as a
                    teacher. To accept this invitation, sign in through Auth0
                    using the email address that received the invitation.
                  </p>
                  <div className={styles.infoPanel}>
                    <p className={styles.infoPanelTitle}>
                      What is freeCodeCamp Classroom?
                    </p>
                    <p>
                      Classroom helps teachers organize student learning on top
                      of the freeCodeCamp curriculum, certifications, and
                      progress tracking tools.
                    </p>
                    <div className={styles.linkRow}>
                      <a
                        href='https://www.freecodecamp.org/'
                        target='_blank'
                        rel='noreferrer'
                        className={styles.inlineLink}
                      >
                        Explore freeCodeCamp.org
                      </a>
                      <a
                        href='https://www.freecodecamp.org/learn/'
                        target='_blank'
                        rel='noreferrer'
                        className={styles.inlineLink}
                      >
                        View certifications and curriculum
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={handleSignIn}
                    className={styles.primaryButton}
                  >
                    Sign In with Auth0
                  </button>
                </>
              ) : success ? (
                <>
                  <h2 className={styles.successTitle}>
                    ✓ Invitation Accepted!
                  </h2>
                  <p className={styles.copy}>
                    Welcome to freeCodeCamp Classroom. You&apos;ll be redirected
                    shortly to the site. If that does not happen, use the link
                    below.
                  </p>
                  <Link href={redirectPath} className={styles.continueLink}>
                    {successDestinationLabel}
                  </Link>
                </>
              ) : (
                <>
                  <div className={styles.statusCard}>
                    <p>
                      <strong>Signed in as:</strong> {userSession.user.email}
                    </p>
                  </div>

                  {error && <div className={styles.errorCard}>{error}</div>}

                  {!error && (
                    <>
                      <p className={styles.copy}>
                        Click the button below to accept your invitation and
                        become a teacher.
                      </p>
                      <div className={styles.infoPanel}>
                        <p className={styles.infoPanelTitle}>
                          About freeCodeCamp Classroom
                        </p>
                        <p>
                          Classroom gives teachers a focused dashboard for
                          managing classes built around the freeCodeCamp
                          learning platform.
                        </p>
                        <p>
                          You can explore the wider freeCodeCamp platform and
                          curriculum here before continuing.
                        </p>
                        <div className={styles.linkRow}>
                          <a
                            href='https://www.freecodecamp.org/'
                            target='_blank'
                            rel='noreferrer'
                            className={styles.inlineLink}
                          >
                            Visit freeCodeCamp.org
                          </a>
                          <a
                            href='https://www.freecodecamp.org/learn/'
                            target='_blank'
                            rel='noreferrer'
                            className={styles.inlineLink}
                          >
                            Browse certifications
                          </a>
                        </div>
                      </div>
                    </>
                  )}

                  <div className={styles.actions}>
                    <button
                      onClick={handleAcceptInvite}
                      disabled={loading}
                      className={styles.primaryButton}
                    >
                      {loading ? 'Accepting...' : 'Accept Invitation'}
                    </button>

                    {error && (
                      <button
                        onClick={handleSignIn}
                        className={styles.secondaryButton}
                      >
                        Sign In with Different Account
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
