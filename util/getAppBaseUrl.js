/**
 * The public base URL of the Classroom app, for links that get shared outside
 * the app (class invite links, teacher invite emails).
 *
 * Prefers the configured URL, so links are correct behind any proxy. Falls
 * back to the request's own host for local development.
 *
 * @param {object} [req] - Next.js / Node request object
 * @returns {string} Base URL with no trailing slash
 */
export function getAppBaseUrl(req) {
  const hostFromHeader = req?.headers?.host
    ? `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`
    : null;

  const baseUrl =
    process.env.CLASSROOM_APP_BASE_URL ||
    process.env.NEXTAUTH_URL ||
    hostFromHeader ||
    'http://localhost:3001';

  return baseUrl.replace(/\/+$/, '');
}
