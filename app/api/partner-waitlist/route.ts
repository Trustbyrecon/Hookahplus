import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export async function POST(req: Request) {
  const formData = await req.formData();
  const entry = {
    name: formData.get('name')?.toString() || '',
    email: formData.get('email')?.toString() || '',
    city: formData.get('city')?.toString() || '',
    pos: formData.get('pos')?.toString() || '',
    timestamp: new Date().toISOString(),
  };

  const logPath = path.join(process.cwd(), 'PartnerSignal_Log.yaml');
  let existing: any[] = [];
  if (fs.existsSync(logPath)) {
    const current = fs.readFileSync(logPath, 'utf8');
    existing = (yaml.load(current) as any[]) || [];
  }
  existing.push(entry);
  fs.writeFileSync(logPath, yaml.dump(existing));

  const config = {
    name: entry.name,
    city: entry.city,
    pos: entry.pos,
  };
  const configPath = path.join(
    process.cwd(),
    'public',
    'qr_hookahplus_config.yaml'
  );
  fs.writeFileSync(configPath, yaml.dump(config));

  return NextResponse.json({ ok: true });
}
