/**
 * Price Lock Utilities
 * 
 * Ensures price integrity by locking final prices and preventing changes during session lifecycle.
 */

export type PriceLock = {
  sessionId: string;
  finalPriceCents: number;
  priceHash: string;
  components?: Record<string, any>;
  lockedAt: Date;
  operatorId?: string;
  auditNote?: string;
};

const priceLocks = new Map<string, PriceLock>();

/**
 * Lock a price for a session
 */
export function lockPrice(
  sessionId: string,
  finalPriceCents: number,
  components: Record<string, any> = {},
  operatorId?: string,
  auditNote?: string
): PriceLock {
  const priceHash = generatePriceHash(finalPriceCents, components);
  
  const lock: PriceLock = {
    sessionId,
    finalPriceCents,
    priceHash,
    components,
    lockedAt: new Date(),
    operatorId,
    auditNote,
  };
  
  priceLocks.set(sessionId, lock);
  return lock;
}

/**
 * Get locked price for a session, if it exists
 */
export function getLockedPrice(sessionId: string): PriceLock | null {
  return priceLocks.get(sessionId) || null;
}

/**
 * Check if a price is locked for a session
 */
export function isPriceLocked(sessionId: string): boolean {
  return priceLocks.has(sessionId);
}

/**
 * Clear price lock (for testing or admin override)
 */
export function clearPriceLock(sessionId: string): void {
  priceLocks.delete(sessionId);
}

/**
 * Generate a hash for price components to ensure integrity
 */
function generatePriceHash(finalPriceCents: number, components: Record<string, any>): string {
  const payload = JSON.stringify({ finalPriceCents, components });
  // Simple hash for demo - in production, use crypto.createHash
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `lock_${Math.abs(hash).toString(16)}`;
}

