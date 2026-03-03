import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const dir = path.join(process.cwd(), 'data', 'codex_entries');
  const files = fs.readdirSync(dir);
  const entries = files.map((file) => {
    const filePath = path.join(dir, file);
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = file.endsWith('.yaml') || file.endsWith('.yml')
      ? (yaml.load(raw) as any)
      : JSON.parse(raw);
    return data;
  });
  entries.sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
  );
  res.status(200).json(entries);
}
