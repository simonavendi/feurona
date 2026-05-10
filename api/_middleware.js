export function requireAuth(req, res) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const cookies = Object.fromEntries(
    (req.headers.cookie || '').split(';').map(c => c.trim().split('=').map(decodeURIComponent))
  );
  const token = cookies['admin_token'];
  if (!token || !adminPassword || token !== Buffer.from(adminPassword).toString('base64')) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}
