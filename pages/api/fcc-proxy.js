export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse cookies from request header
    const cookies = {};
    if (req.headers.cookie) {
      req.headers.cookie.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        cookies[name] = decodeURIComponent(value);
      });
    }

    // Get token from cookie if it exists
    const cookieToken = cookies.jwt_access_token;
    const { emails } = req.body;

    if (!cookieToken) {
      console.log('Unauthorized!');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!emails || !Array.isArray(emails)) {
      console.log('Missing or invalid emails array');
      return res.status(400).json({ error: 'Missing emails array' });
    }

    // Convert email array to comma-separated string
    const emailsString = emails.join(',');

    // Build the URL with query parameters
    const fccUrl = `http://localhost:3000/api/protected/classroom/get-user-data?emails=${encodeURIComponent(
      emailsString
    )}`;

    const headers = {
      'Content-Type': 'application/json',
      Cookie: `jwt_access_token=${cookieToken}`
    };

    // Make the request - change to GET method and remove body
    const fccResponse = await fetch(fccUrl, {
      method: 'GET',
      headers,
      credentials: 'include'
    });

    // Get the response data
    const data = await fccResponse.json();

    // Return the data to the client
    return res.status(fccResponse.status).json(data);
  } catch (error) {
    console.error('Error proxying request to FCC:', error);
    return res.status(500).json({ error: 'Failed to fetch from FCC' });
  }
}
