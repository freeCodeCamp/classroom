const MAX_USER_IDS_PER_REQUEST = 50;

function getFccApiUrl() {
  return process.env.FCC_API_URL;
}

function getHeaders() {
  const token = process.env.TPA_API_BEARER_TOKEN;
  if (!token) {
    throw new Error('TPA_API_BEARER_TOKEN is not set');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
}

/**
 * Look up a freeCodeCamp user ID by email.
 * Only returns a userId for users who have opted into classroom mode.
 *
 * @param {string} email
 * @returns {Promise<{userId: string}>} userId is empty string if not found
 */
export async function fetchUserIdByEmail(email) {
  const res = await fetch(`${getFccApiUrl()}/apps/classroom/get-user-id`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email })
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    console.error(
      'get-user-id failed',
      res.status,
      body.error || res.statusText
    );
    throw new Error('Failed to look up fCC user ID');
  }

  return res.json();
}

/**
 * Fetch challenge completion data for an array of fCC user IDs.
 * Automatically batches requests when there are more than 50 IDs.
 *
 * @param {string[]} userIds - Array of fCC user ObjectIDs
 * @returns {Promise<{data: Object.<string, Array<{id: string, completedDate: number}>>}>}
 */
export async function fetchUserData(userIds) {
  if (!userIds || userIds.length === 0) {
    return { data: {} };
  }

  // Batch into chunks of 50
  const chunks = [];
  for (let i = 0; i < userIds.length; i += MAX_USER_IDS_PER_REQUEST) {
    chunks.push(userIds.slice(i, i + MAX_USER_IDS_PER_REQUEST));
  }

  const results = await Promise.all(
    chunks.map(async chunk => {
      const res = await fetch(
        `${getFccApiUrl()}/apps/classroom/get-user-data`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ userIds: chunk })
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error(
          'get-user-data failed',
          res.status,
          body.error || res.statusText
        );
        throw new Error('Failed to fetch student data from fCC API');
      }

      return res.json();
    })
  );

  // Merge all batch results into a single data object
  const merged = {};
  for (const result of results) {
    Object.assign(merged, result.data);
  }

  return { data: merged };
}
