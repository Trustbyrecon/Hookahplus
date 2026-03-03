import crypto from 'crypto';

/** Safe UUID: works in Node and browser (Web Crypto API or fallback) */
function safeRandomUUID(): string {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
    return (crypto as any).randomUUID();
  }
  // Fallback: random hex
  const hex = crypto.randomBytes(16).toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

/**
 * GhostLog Lite - Immutable Trust Stamping System
 * 
 * Creates SHA-256 hashes for event integrity and trust verification.
 * Each event is stamped with a unique hash that cannot be tampered with.
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

export interface TrustStamp {
  ghostHash: string;
  signature: string;
  timestamp: string;
  nonce: string;
}

/**
 * Generate a cryptographically secure nonce
 */
export function generateNonce(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Create a trust stamp for an event
 */
export function createTrustStamp(
  payload: Record<string, any>,
  timestamp?: string,
  nonce?: string
): TrustStamp {
  const ts = timestamp || new Date().toISOString();
  const n = nonce || generateNonce();
  
  // Create the data to hash
  const dataToHash = {
    payload,
    timestamp: ts,
    nonce: n
  };
  
  // Convert to deterministic JSON string
  const dataString = JSON.stringify(dataToHash, Object.keys(dataToHash).sort());
  
  // Create SHA-256 hash
  const ghostHash = crypto.createHash('sha256').update(dataString).digest('hex');
  
  // Create signature (in production, this would use a private key)
  const signature = crypto.createHmac('sha256', process.env.GHOSTLOG_SECRET || 'default-secret')
    .update(ghostHash)
    .digest('hex');
  
  return {
    ghostHash,
    signature,
    timestamp: ts,
    nonce: n
  };
}

/**
 * Create a GhostLog entry
 */
export function createGhostLogEntry(
  eventType: string,
  payload: Record<string, any>,
  eventId?: string
): GhostLogEntry {
  const eventIdGenerated = eventId || safeRandomUUID();
  const timestamp = new Date().toISOString();
  const nonce = generateNonce();
  
  const trustStamp = createTrustStamp(payload, timestamp, nonce);
  
  return {
    eventId: eventIdGenerated,
    eventType,
    payload,
    timestamp,
    nonce,
    ghostHash: trustStamp.ghostHash,
    signature: trustStamp.signature
  };
}

/**
 * Guest-specific event hashing
 */
export function hashGuestEvent(
  eventType: string,
  guestId: string,
  loungeId: string,
  sessionId: string | undefined,
  payload: Record<string, any>
): TrustStamp {
  const eventPayload = {
    eventType,
    guestId,
    loungeId,
    sessionId,
    ...payload
  };
  
  return createTrustStamp(eventPayload);
}

/**
 * Session-specific event hashing
 */
export function hashSessionEvent(
  sessionId: string,
  eventType: string,
  payload: Record<string, any>
): TrustStamp {
  const eventPayload = {
    sessionId,
    eventType,
    ...payload
  };
  
  return createTrustStamp(eventPayload);
}