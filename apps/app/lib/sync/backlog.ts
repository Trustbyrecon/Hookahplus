/**
 * Offline Sync Backlog
 * Phase 4: Night After Night Engine - Reliability & Config Versioning
 * 
 * Handles offline operations and syncs them when connection is restored
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface SyncOperation {
  id: string;
  deviceId: string;
  loungeId: string;
  operation: string; // 'CREATE_SESSION' | 'UPDATE_ORDER' | 'ADD_NOTE' | etc.
  payload: Record<string, any>;
  status: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
  retryCount: number;
  lastAttempt?: Date;
  createdAt: Date;
  syncedAt?: Date;
}

/**
 * Add operation to sync backlog
 */
export async function addToSyncBacklog(
  deviceId: string,
  loungeId: string,
  operation: string,
  payload: Record<string, any>
): Promise<string> {
  const backlogItem = await prisma.syncBacklog.create({
    data: {
      deviceId,
      loungeId,
      operation,
      payload: JSON.stringify(payload),
      status: 'PENDING'
    }
  });

  return backlogItem.id;
}

/**
 * Get pending sync operations for a device
 */
export async function getPendingSyncOperations(
  deviceId: string,
  limit: number = 50
): Promise<SyncOperation[]> {
  const items = await prisma.syncBacklog.findMany({
    where: {
      deviceId,
      status: 'PENDING'
    },
    orderBy: { createdAt: 'asc' },
    take: limit
  });

  return items.map(item => ({
    id: item.id,
    deviceId: item.deviceId,
    loungeId: item.loungeId,
    operation: item.operation,
    payload: JSON.parse(item.payload),
    status: item.status as 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED',
    retryCount: item.retryCount,
    lastAttempt: item.lastAttempt || undefined,
    createdAt: item.createdAt,
    syncedAt: item.syncedAt || undefined
  }));
}

/**
 * Mark sync operation as syncing
 */
export async function markSyncing(backlogId: string): Promise<void> {
  await prisma.syncBacklog.update({
    where: { id: backlogId },
    data: {
      status: 'SYNCING',
      lastAttempt: new Date()
    }
  });
}

/**
 * Mark sync operation as synced
 */
export async function markSynced(backlogId: string): Promise<void> {
  await prisma.syncBacklog.update({
    where: { id: backlogId },
    data: {
      status: 'SYNCED',
      syncedAt: new Date()
    }
  });
}

/**
 * Mark sync operation as failed and increment retry count
 */
export async function markFailed(backlogId: string, maxRetries: number = 5): Promise<boolean> {
  const item = await prisma.syncBacklog.findUnique({
    where: { id: backlogId }
  });

  if (!item) {
    return false;
  }

  const newRetryCount = item.retryCount + 1;

  if (newRetryCount >= maxRetries) {
    // Mark as permanently failed
    await prisma.syncBacklog.update({
      where: { id: backlogId },
      data: {
        status: 'FAILED',
        lastAttempt: new Date()
      }
    });
    return false; // Don't retry
  }

  // Mark as pending for retry
  await prisma.syncBacklog.update({
    where: { id: backlogId },
    data: {
      status: 'PENDING',
      retryCount: newRetryCount,
      lastAttempt: new Date()
    }
  });

  return true; // Should retry
}

/**
 * Process sync backlog for a device
 * Attempts to sync all pending operations
 */
export async function processSyncBacklog(
  deviceId: string,
  syncHandler: (operation: SyncOperation) => Promise<void>
): Promise<{
  synced: number;
  failed: number;
  errors: number;
}> {
  let synced = 0;
  let failed = 0;
  let errors = 0;

  const pending = await getPendingSyncOperations(deviceId);

  for (const operation of pending) {
    try {
      await markSyncing(operation.id);

      try {
        await syncHandler(operation);
        await markSynced(operation.id);
        synced++;
      } catch (syncError) {
        console.error(`[sync] Error syncing operation ${operation.id}:`, syncError);
        const shouldRetry = await markFailed(operation.id);
        if (!shouldRetry) {
          failed++;
        }
      }
    } catch (error) {
      console.error(`[sync] Error processing operation ${operation.id}:`, error);
      errors++;
    }
  }

  return { synced, failed, errors };
}

/**
 * Clean up old synced operations
 * Removes operations that were synced more than 7 days ago
 */
export async function cleanupOldSyncedOperations(): Promise<number> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const result = await prisma.syncBacklog.deleteMany({
    where: {
      status: 'SYNCED',
      syncedAt: {
        lt: sevenDaysAgo
      }
    }
  });

  return result.count;
}

