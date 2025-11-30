// pages/api/ping.js
export default function handler(req, res) {
  res.status(200).json({ ok: true, path: '/api/ping' });
}
