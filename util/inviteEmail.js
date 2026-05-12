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

${inviterLabel} has invited you to join freeCodeCamp Classroom as a teacher!

To accept this invitation, click the link below:
${resolvedInviteUrl}

This link will expire on ${expiryText}.

If you don't have a freeCodeCamp account yet, you'll be able to create one during the acceptance process.

Best regards,
The freeCodeCamp Team`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Welcome to freeCodeCamp Classroom!</h2>
            <p><strong>${inviterLabel}</strong> has invited you to join freeCodeCamp Classroom as a teacher.</p>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p>To accept this invitation and get started, click the button below:</p>
              <a href="${resolvedInviteUrl}" style="display: inline-block; background: #0891b2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Accept Invitation</a>
            </div>
            
            <p><strong>Invitation Link:</strong></p>
            <p><a href="${resolvedInviteUrl}">${resolvedInviteUrl}</a></p>
            
            <p style="color: #666; font-size: 0.9em;">
              <strong>Note:</strong> This invitation link will expire on ${expiryText}.
            </p>
            
            <p style="color: #666; font-size: 0.9em;">
              If you don't have a freeCodeCamp account, you'll be able to create one when you accept this invitation using your invited email address.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #666; font-size: 0.85em;">
              Best regards,<br>
              The freeCodeCamp Team
            </p>
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
