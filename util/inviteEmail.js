import nodemailer from 'nodemailer';

/**
 * Build the teacher invite URL
 * @param {object|string} reqOrToken - Next.js request object or invite token
 * @param {string} maybeInviteToken - The invitation token when request is provided
 * @returns {string} The full invitation URL
 */
export function buildTeacherInviteUrl(reqOrToken, maybeInviteToken) {
  const inviteToken =
    typeof reqOrToken === 'string' ? reqOrToken : maybeInviteToken;

  const hostFromHeader =
    typeof reqOrToken === 'object' && reqOrToken?.headers?.host
      ? `${reqOrToken.headers['x-forwarded-proto'] || 'http'}://${reqOrToken.headers.host}`
      : null;

  const baseUrl =
    process.env.CLASSROOM_APP_BASE_URL ||
    process.env.NEXTAUTH_URL ||
    hostFromHeader ||
    'http://localhost:3001';

  return `${baseUrl}/teacher/invite/${inviteToken}`;
}

/**
 * Create an SMTP transporter for sending emails
 * @returns {object} Nodemailer transporter or null if config is missing
 */
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // Check if essential config is present
  if (!host || !port) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: parseInt(port),
    secure,
    auth: {
      user,
      pass
    }
  });
}

/**
 * Get the sender email address, with fallback if SMTP_FROM is not set
 * @returns {string} The sender email address
 */
function getSenderEmail() {
  if (process.env.SMTP_FROM) {
    return process.env.SMTP_FROM;
  }
  // Fallback: use SMTP_USER if available
  if (process.env.SMTP_USER) {
    return process.env.SMTP_USER;
  }
  // Last resort
  return 'noreply@classroom.freecodecamp.org';
}

/**
 * Send a teacher invitation email
 * @param {object} params
 * @param {string} params.invitedTeacherEmail - The teacher's email address
 * @param {string} [params.inviteUrl] - Precomputed invite URL
 * @param {Date} [params.expiresAt] - Expiry date for invite
 * @param {string} [params.invitedByEmail] - Email of inviter
 * @returns {Promise<object>} Result including messageId
 */
export async function sendTeacherInvitationEmail({
  invitedTeacherEmail,
  inviteUrl,
  expiresAt,
  invitedByEmail
}) {
  if (!invitedTeacherEmail) {
    throw new Error('No recipient email provided');
  }

  const transporter = createTransporter();
  if (!transporter) {
    throw new Error('SMTP configuration is missing or invalid');
  }

  const resolvedInviteUrl = inviteUrl;
  if (!resolvedInviteUrl) {
    throw new Error('Invite URL is required to send invitation email');
  }
  const senderEmail = getSenderEmail();
  const inviterLabel = invitedByEmail || 'a freeCodeCamp admin';
  const expiryText = expiresAt
    ? new Date(expiresAt).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
      })
    : '7 days from now';

  const mailOptions = {
    from: senderEmail,
    to: invitedTeacherEmail,
    subject: 'Join freeCodeCamp Classroom as a Teacher',
    text: `Hi there,

freeCodeCamp Classroom

Teacher Invitation

You have been invited to join freeCodeCamp Classroom as a teacher.

This invitation expires on ${expiryText}.

Accept Invitation
${resolvedInviteUrl}

Selecting "Accept Invitation" will redirect you to the freeCodeCamp Classroom application.

You will need to sign in through Auth0 with your invited email address to access Classroom.

If the button does not work, use this secure link:
${resolvedInviteUrl}

This invitation was sent by ${inviterLabel}.

If you were not expecting this invitation, you can safely ignore this email.

The freeCodeCamp Team`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 24px; background-color: #f5f6f7; font-family: Helvetica, Arial, sans-serif; color: #0a0a23;">
          <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #d0d0d5; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <div style="padding: 24px 32px; background: #0a0a23;">
              <p style="margin: 0 0 8px; font-size: 32px; line-height: 1.15; font-weight: 700; color: #ffffff;">freeCodeCamp Classroom</p>
              <h1 style="margin: 0; font-size: 20px; line-height: 1.3; color: rgba(255,255,255,0.92); font-weight: 600;">Teacher Invitation</h1>
            </div>

            <div style="padding: 32px;">
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.7;">You have been invited to join freeCodeCamp Classroom as a teacher.</p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.7;">This invitation expires on <strong>${expiryText}</strong>.</p>

              <div style="margin: 0 0 24px;">
                <a href="${resolvedInviteUrl}" style="display: inline-block; padding: 14px 28px; border: 2px solid #0a0a23; background: #fecc4c; color: #0a0a23; text-decoration: none; font-size: 16px; font-weight: 700;">Accept Invitation</a>
              </div>

              <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #3b3b4f;">Selecting Accept Invitation will redirect you to the freeCodeCamp Classroom application.</p>
              <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #3b3b4f;">You will need to sign in through Auth0 with your invited email address to access Classroom.</p>

              <p style="margin: 0 0 8px; font-size: 15px; line-height: 1.7;"><strong>If the button does not work, use this secure link:</strong></p>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.7; word-break: break-word;"><a href="${resolvedInviteUrl}" style="color: #0a0a23;">${resolvedInviteUrl}</a></p>

              <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #3b3b4f;">This invitation was sent by ${inviterLabel}.</p>
              <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #3b3b4f;">If you were not expecting this invitation, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: result.messageId
    };
  } catch (error) {
    console.error('Error sending teacher invitation email:', error);
    throw error;
  }
}
