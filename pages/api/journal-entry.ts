import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'staffJournalEntries.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const token = req.headers['x-user-token'];
  if (!token) {
    res.status(401).json({ error: 'Missing user token' });
    return;
  }

  const { entry } = req.body as { entry: string };
  const raw = fs.existsSync(DATA_PATH) ? fs.readFileSync(DATA_PATH, 'utf8') : '{"entries":[]}' ;
  const data = JSON.parse(raw);
  data.entries.push({ entry, timestamp: new Date().toISOString() });
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));

  let whisper: string | null = null;
  if (/overwhelmed/i.test(entry)) {
    whisper = "Noted. We'll slow reminders during peak times.";
  }

  res.status(200).json({ success: true, whisper });
}
