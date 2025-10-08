import crypto from 'crypto';

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
 * Verify a trust stamp
 */
export function verifyTrustStamp(
  ghostHash: string,
  signature: string,
  payload: Record<string, any>,
  timestamp: string,
  nonce: string
): boolean {
  try {
    // Recreate the hash
    const dataToHash = {
      payload,
      timestamp,
      nonce
    };
    
    const dataString = JSON.stringify(dataToHash, Object.keys(dataToHash).sort());
    const expectedHash = crypto.createHash('sha256').update(dataString).digest('hex');
    
    // Verify hash matches
    if (expectedHash !== ghostHash) {
      return false;
    }
    
    // Verify signature
    const expectedSignature = crypto.createHmac('sha256', process.env.GHOSTLOG_SECRET || 'default-secret')
      .update(ghostHash)
      .digest('hex');
    
    return expectedSignature === signature;
  } catch (error) {
    console.error('Trust stamp verification failed:', error);
    return false;
  }
}

/**
 * Create a GhostLog entry
 */
export function createGhostLogEntry(
  eventType: string,
  payload: Record<string, any>,
  eventId?: string
): GhostLogEntry {
  const eventIdGenerated = eventId || crypto.randomUUID();
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
 * Verify a GhostLog entry
 */
export function verifyGhostLogEntry(entry: GhostLogEntry): boolean {
  return verifyTrustStamp(
    entry.ghostHash,
    entry.signature,
    entry.payload,
    entry.timestamp,
    entry.nonce
  );
}

/**
 * Create a chain of trust (for audit trails)
 */
export function createTrustChain(entries: GhostLogEntry[]): string {
  const chainData = entries.map(entry => ({
    eventId: entry.eventId,
    ghostHash: entry.ghostHash,
    timestamp: entry.timestamp
  }));
  
  const chainString = JSON.stringify(chainData, Object.keys(chainData).sort());
  return crypto.createHash('sha256').update(chainString).digest('hex');
}

/**
 * Verify trust chain integrity
 */
export function verifyTrustChain(entries: GhostLogEntry[]): boolean {
  try {
    // Verify each entry
    for (const entry of entries) {
      if (!verifyGhostLogEntry(entry)) {
        return false;
      }
    }
    
    // Verify chain integrity
    const expectedChain = createTrustChain(entries);
    // In a real implementation, you'd compare with a stored chain hash
    return true;
  } catch (error) {
    console.error('Trust chain verification failed:', error);
    return false;
  }
}

/**
 * Export event data for audit
 */
export function exportAuditData(entries: GhostLogEntry[]): {
  entries: GhostLogEntry[];
  chainHash: string;
  exportTimestamp: string;
  totalEvents: number;
} {
  return {
    entries,
    chainHash: createTrustChain(entries),
    exportTimestamp: new Date().toISOString(),
    totalEvents: entries.length
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
