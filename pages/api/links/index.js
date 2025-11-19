// pages/api/links/index.js
import { query } from '../../../../lib/db';
import validator from 'validator';

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function randomCode(len = 6) {
  let s = '';
  for (let i = 0; i < len; i++) s += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  return s;
}

async function generateUniqueCode() {
  // try length 6..8 with multiple attempts
  for (let len = 6; len <= 8; len++) {
    for (let tries = 0; tries < 8; tries++) {
      const cand = randomCode(len);
      const { rowCount } = await query('SELECT 1 FROM links WHERE code = $1', [cand]);
      if (rowCount === 0) return cand;
    }
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const result = await query('SELECT code, target_url, clicks, last_clicked, created_at FROM links ORDER BY created_at DESC', []);
    return res.status(200).json(result.rows);
  }

  if (req.method === 'POST') {
    const body = req.body || req;
    // Next/Express compatibility: Next automatically parses JSON body for API routes.
    const { target_url, code: customCode } = req.body || {};
    if (!target_url || !validator.isURL(target_url, { require_protocol: true })) {
      return res.status(400).json({ error: 'Invalid target_url. Include protocol (http:// or https://).' });
    }

    let codeToUse = null;
    if (customCode) {
      if (!CODE_REGEX.test(customCode)) {
        return res.status(400).json({ error: 'Custom code must match [A-Za-z0-9]{6,8}.' });
      }
      // uniqueness
      const { rowCount } = await query('SELECT 1 FROM links WHERE code = $1', [customCode]);
      if (rowCount > 0) {
        return res.status(409).json({ error: 'Code already exists.' });
      }
      codeToUse = customCode;
    } else {
      codeToUse = await generateUniqueCode();
      if (!codeToUse) return res.status(500).json({ error: 'Failed to generate unique code, try again.' });
    }

    await query('INSERT INTO links (code, target_url) VALUES ($1, $2)', [codeToUse, target_url]);
    const payload = { code: codeToUse, target_url, short_url: `${process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || ''}/${codeToUse}` };
    return res.status(201).json(payload);
  }

  res.setHeader('Allow', 'GET,POST');
  res.status(405).end('Method Not Allowed');
}
