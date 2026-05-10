import { put, list, del, head } from '@vercel/blob';
import { requireAuth } from './_middleware.js';

const MANIFEST_KEY = 'portfolio/entries.json';

async function getEntries() {
  try {
    const { blobs } = await list({ prefix: MANIFEST_KEY });
    if (!blobs.length) return [];
    const res = await fetch(blobs[0].url);
    return await res.json();
  } catch {
    return [];
  }
}

async function saveEntries(entries) {
  await put(MANIFEST_KEY, JSON.stringify(entries), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  });
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const entries = await getEntries();
    return res.status(200).json(entries);
  }

  if (!requireAuth(req, res)) return;

  if (req.method === 'POST') {
    const { title, slug, description, coverImage, images } = req.body;
    if (!title || !slug || !coverImage) {
      return res.status(400).json({ error: 'title, slug, coverImage required' });
    }
    const entries = await getEntries();
    if (entries.find(e => e.slug === slug)) {
      return res.status(409).json({ error: 'Slug already exists' });
    }
    const entry = { id: Date.now().toString(), title, slug, description: description || '', coverImage, images: images || [], createdAt: new Date().toISOString() };
    entries.unshift(entry);
    await saveEntries(entries);
    return res.status(201).json(entry);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    const entries = await getEntries();
    const filtered = entries.filter(e => e.id !== id);
    if (filtered.length === entries.length) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    await saveEntries(filtered);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
