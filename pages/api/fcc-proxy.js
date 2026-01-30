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
    const { targetUrl, ...bodyData } = req.body;

    if (!cookieToken) {
      console.log('Unauthorized!');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!targetUrl) {
      console.log('Missing targetUrl');
      return res.status(400).json({ error: 'Missing targetUrl' });
    }

    console.log('proxy hit', {
      targetUrl,
      bodyDataKeys: Object.keys(bodyData)
    });

    // Build the full FCC URL
    const fccUrl = `http://localhost:3000${targetUrl}`;

    const headers = {
      'Content-Type': 'application/json',
      Cookie: `jwt_access_token=${cookieToken}`
    };

    // Make POST request with body data
    const fccResponse = await fetch(fccUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(bodyData),
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
