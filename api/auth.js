export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD env var not set' });
  }

  if (password === adminPassword) {
    res.setHeader('Set-Cookie', `admin_token=${Buffer.from(adminPassword).toString('base64')}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ error: 'Invalid password' });
}
