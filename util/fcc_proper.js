const { getSession } = require('next-auth/react');

async function fetchFromFCC(options = {}, context = null) {
  // Get session, with context if provided (for server-side calls)
  const session = context ? await getSession(context) : await getSession();

  if (!session) {
    throw new Error('User not authenticated');
  }

  // Determine if we're running on the server
  const isServer = typeof window === 'undefined';

  // Use absolute URL when on server, relative URL when on client
  const baseUrl = isServer
    ? process.env.NEXTAUTH_URL || 'http://localhost:3001'
    : '';
  const url = `${baseUrl}/api/fcc-proxy`;

  // Get the auth cookie if we're server-side and have context
  let headers = {
    'Content-Type': 'application/json'
  };

  // If we're in a server context, forward the cookie header
  if (isServer && context && context.req && context.req.headers.cookie) {
    headers['Cookie'] = context.req.headers.cookie;
  }

  // Send the request to our server-side API route
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      emails: options.emails || [],
      options: options,
      targetUrl: options.targetUrl
    }),
    credentials: 'include' // Important for cookies
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json();
}

module.exports = {
  fetchFromFCC
};
