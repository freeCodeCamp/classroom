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
      ...options,
      targetUrl: options.targetUrl
    }),
    credentials: 'include' // Important for cookies
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json();
}

/**
 * Get FCC Proper User ID for a single email
 * @param {string} email - Student email
 * @param {Object} context - Next.js context (for server-side auth)
 * @returns {Promise<string|null>} - FCC Proper user ID or null if not found
 */
async function getFccProperUserIdByEmail(email, context = null) {
  const response = await fetchFromFCC(
    {
      email: email,
      inClassroom: true, // Special flag for classroom app access
      targetUrl: '/api/protected/classroom/get-user-id'
    },
    context
  );

  console.log('getFccProperUserIdByEmail response:', response);
  console.log(
    'getFccProperUserIdByEmail response.data?.userId:',
    response?.userId
  );

  return response?.userId || null;
}

/**
 * Get student progress data for multiple FCC Proper User IDs
 * @param {string[]} userIds - Array of FCC Proper user IDs (max 50)
 * @param {Object} context - Next.js context (for server-side auth)
 * @returns {Promise<Object>} - { userId: [completedChallenges], ... }
 */
async function getStudentDataByUserIds(userIds, context = null) {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new Error('userIds must be a non-empty array');
  }

  if (userIds.length > 50) {
    throw new Error('Maximum 50 user IDs allowed per request');
  }

  const response = await fetchFromFCC(
    {
      userIds: userIds,
      inClassroom: true,
      targetUrl: '/api/protected/classroom/get-user-data'
    },
    context
  );

  return response.data || {};
}

module.exports = {
  fetchFromFCC,
  getFccProperUserIdByEmail,
  getStudentDataByUserIds
};
