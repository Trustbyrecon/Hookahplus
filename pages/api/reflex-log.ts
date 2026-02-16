import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const filePath = path.join(process.cwd(), 'data', 'ReflexLog.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  const events = JSON.parse(raw);
  res.status(200).json(events);
}
