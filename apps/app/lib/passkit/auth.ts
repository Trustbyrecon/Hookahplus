import { createHmac } from 'crypto';

function base64Url(buf: Buffer): string {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function computePassAuthToken(args: { serialNumber: string; secret: string }): string {
  const mac = createHmac('sha256', args.secret).update(args.serialNumber).digest();
  return base64Url(mac);
}

export function parseApplePassAuthorizationHeader(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  const prefix = 'ApplePass ';
  if (!trimmed.startsWith(prefix)) return null;
  return trimmed.slice(prefix.length).trim() || null;
}

