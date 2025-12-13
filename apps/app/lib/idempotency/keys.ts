/**
 * Idempotency Layer
 * Phase 4: Night After Night Engine - Reliability & Config Versioning
 * 
 * Prevents duplicate operations using idempotency keys
 * Critical for webhooks and retried operations
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// In-memory cache for idempotency keys (TTL: 24 hours)
const idempotencyCache = new Map<string, { result: any; expiresAt: number }>();

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate idempotency key from operation data
 */
export function generateIdempotencyKey(
  operation: string,
  ...args: any[]
): string {
  const data = JSON.stringify({ operation, args });
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Check if operation with idempotency key has already been processed
 * Returns cached result if found, null otherwise
 */
export async function checkIdempotency(
  idempotencyKey: string
): Promise<any | null> {
  // Check in-memory cache first
  const cached = idempotencyCache.get(idempotencyKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.result;
  }

  // Check database (using audit logs as idempotency store)
  // Look for recent audit log with same idempotency key
  const oneDayAgo = new Date(Date.now() - CACHE_TTL);
  
  const existing = await prisma.auditLog.findFirst({
    where: {
      changes: {
        contains: idempotencyKey
      },
      createdAt: {
        gte: oneDayAgo
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  if (existing) {
    // Extract result from audit log if available
    const changes = existing.changes ? JSON.parse(existing.changes) : {};
    const result = changes.idempotencyResult || { processed: true, entityId: existing.entityId };
    
    // Cache it
    idempotencyCache.set(idempotencyKey, {
      result,
      expiresAt: Date.now() + CACHE_TTL
    });

    return result;
  }

  return null;
}

/**
 * Store idempotency result
 */
export async function storeIdempotencyResult(
  idempotencyKey: string,
  result: any,
  metadata?: {
    loungeId?: string;
    userId?: string;
    entityType?: string;
    entityId?: string;
  }
): Promise<void> {
  // Store in cache
  idempotencyCache.set(idempotencyKey, {
    result,
    expiresAt: Date.now() + CACHE_TTL
  });

  // Store in audit log for persistence
  if (metadata) {
    await prisma.auditLog.create({
      data: {
        loungeId: metadata.loungeId,
        userId: metadata.userId,
        action: 'IDEMPOTENCY_STORED',
        entityType: metadata.entityType,
        entityId: metadata.entityId,
        changes: JSON.stringify({
          idempotencyKey,
          idempotencyResult: result
        })
      }
    });
  }
}

/**
 * Execute operation with idempotency protection
 * Returns cached result if operation was already executed
 */
export async function executeWithIdempotency<T>(
  idempotencyKey: string,
  operation: () => Promise<T>,
  metadata?: {
    loungeId?: string;
    userId?: string;
    entityType?: string;
    entityId?: string;
  }
): Promise<T> {
  // Check if already processed
  const cached = await checkIdempotency(idempotencyKey);
  if (cached) {
    return cached as T;
  }

  // Execute operation
  const result = await operation();

  // Store result
  await storeIdempotencyResult(idempotencyKey, result, metadata);

  return result;
}

/**
 * Clean up expired idempotency cache entries
 */
export function cleanupIdempotencyCache(): number {
  const now = Date.now();
  let cleaned = 0;

  // Convert iterator to array for ES5 compatibility
  const entries = Array.from(idempotencyCache.entries());
  for (const [key, value] of entries) {
    if (value.expiresAt <= now) {
      idempotencyCache.delete(key);
      cleaned++;
    }
  }

  return cleaned;
}

/**
 * Middleware helper for API routes
 * Extracts idempotency key from request headers
 */
export function getIdempotencyKeyFromRequest(req: Request): string | null {
  const header = req.headers.get('idempotency-key') || 
                 req.headers.get('x-idempotency-key');
  return header || null;
}

