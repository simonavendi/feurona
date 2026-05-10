import { put } from '@vercel/blob';
import { requireAuth } from './_middleware.js';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAuth(req, res)) return;

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const buffer = Buffer.concat(chunks);

  const contentType = req.headers['content-type'] || '';
  const boundary = contentType.split('boundary=')[1];
  if (!boundary) return res.status(400).json({ error: 'No boundary in multipart' });

  const parts = parseMultipart(buffer, boundary);
  const filePart = parts.find(p => p.name === 'file');
  if (!filePart) return res.status(400).json({ error: 'No file field' });

  const filename = `portfolio/${Date.now()}-${filePart.filename}`;
  const blob = await put(filename, filePart.data, {
    access: 'public',
    contentType: filePart.contentType,
  });

  return res.status(200).json({ url: blob.url });
}

function parseMultipart(buffer, boundary) {
  const parts = [];
  const sep = Buffer.from(`--${boundary}`);
  let start = buffer.indexOf(sep) + sep.length + 2;

  while (start < buffer.length) {
    const end = buffer.indexOf(sep, start);
    if (end === -1) break;
    const part = buffer.slice(start, end - 2);
    const headerEnd = part.indexOf('\r\n\r\n');
    if (headerEnd === -1) { start = end + sep.length + 2; continue; }

    const headerStr = part.slice(0, headerEnd).toString();
    const data = part.slice(headerEnd + 4);

    const nameMatch = headerStr.match(/name="([^"]+)"/);
    const filenameMatch = headerStr.match(/filename="([^"]+)"/);
    const ctMatch = headerStr.match(/Content-Type:\s*([^\r\n]+)/i);

    parts.push({
      name: nameMatch?.[1],
      filename: filenameMatch?.[1],
      contentType: ctMatch?.[1]?.trim() || 'application/octet-stream',
      data,
    });
    start = end + sep.length + 2;
  }
  return parts;
}
