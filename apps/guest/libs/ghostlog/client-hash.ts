/**
 * Client-safe GhostLog - for use in browser components.
 * Uses Web Crypto API only; no Node crypto dependency.
 */

export interface GhostLogEntry {
  eventId: string;
  eventType: string;
  payload: Record<string, any>;
  timestamp: string;
  nonce: string;
  ghostHash: string;
  signature: string;
}

function clientRandomUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  arr[6] = (arr[6]! & 0x0f) | 0x40;
  arr[8] = (arr[8]! & 0x3f) | 0x80;
  const hex = Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(12, 16)}-a${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/**
 * Create a GhostLog entry (client-safe, sync, uses Web Crypto API)
 */
export function createGhostLogEntry(
  eventType: string,
  payload: Record<string, any>,
  eventId?: string
): GhostLogEntry {
  const eventIdGenerated = eventId || clientRandomUUID();
  const timestamp = new Date().toISOString();
  const nonce = clientRandomUUID().replace(/-/g, '').slice(0, 32);
  return {
    eventId: eventIdGenerated,
    eventType,
    payload,
    timestamp,
    nonce,
    ghostHash: 'client',
    signature: 'client',
  };
}
