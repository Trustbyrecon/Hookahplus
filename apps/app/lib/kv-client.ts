/**
 * Unified KV Client
 * Supports Vercel KV (via @vercel/kv) with fallback to Redis URL or in-memory
 */

let kvClient: any = null;
let kvAvailable = false;

/**
 * Initialize KV client (Vercel KV preferred, falls back to Redis URL)
 */
async function initKV(): Promise<boolean> {
  if (kvClient !== null) {
    return kvAvailable;
  }

  // Try Vercel KV first (preferred)
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      // @vercel/kv automatically uses KV_REST_API_URL and KV_REST_API_TOKEN
      const kv = await import('@vercel/kv');
      kvClient = kv.kv;
      kvAvailable = true;
      return true;
    } catch (error) {
      console.warn('[KV] Vercel KV unavailable, trying Redis URL:', error);
    }
  }

  // Fallback to Redis URL (ioredis)
  if (process.env.REDIS_URL) {
    try {
      const Redis = require('ioredis');
      kvClient = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        enableReadyCheck: true,
        lazyConnect: true,
      });
      await kvClient.connect();
      kvAvailable = true;
      return true;
    } catch (error) {
      console.warn('[KV] Redis URL unavailable, using memory store:', error);
    }
  }

  kvAvailable = false;
  return false;
}

/**
 * Get value from KV store
 */
export async function kvGet<T>(key: string): Promise<T | null> {
  const useKV = await initKV();

  if (useKV && kvClient) {
    try {
      // Vercel KV uses different API
      if (process.env.KV_REST_API_URL) {
        const value = await kvClient.get(key);
        return value as T | null;
      } else {
        // Standard Redis (ioredis)
        const data = await kvClient.get(key);
        if (data) {
          return JSON.parse(data) as T;
        }
      }
    } catch (error) {
      console.warn('[KV] Get failed:', error);
    }
  }

  return null;
}

/**
 * Set value in KV store
 */
export async function kvSet<T>(
  key: string,
  value: T,
  ttlSeconds?: number
): Promise<void> {
  const useKV = await initKV();

  if (useKV && kvClient) {
    try {
      // Vercel KV uses different API
      if (process.env.KV_REST_API_URL) {
        if (ttlSeconds) {
          await kvClient.set(key, value, { ex: ttlSeconds });
        } else {
          await kvClient.set(key, value);
        }
      } else {
        // Standard Redis (ioredis)
        const serialized = JSON.stringify(value);
        if (ttlSeconds) {
          await kvClient.setex(key, ttlSeconds, serialized);
        } else {
          await kvClient.set(key, serialized);
        }
      }
    } catch (error) {
      console.warn('[KV] Set failed:', error);
    }
  }
}

/**
 * Delete value from KV store
 */
export async function kvDelete(key: string): Promise<void> {
  const useKV = await initKV();

  if (useKV && kvClient) {
    try {
      await kvClient.del(key);
    } catch (error) {
      console.warn('[KV] Delete failed:', error);
    }
  }
}

/**
 * Get multiple keys matching a pattern (Redis only, not available in Vercel KV)
 */
export async function kvKeys(pattern: string): Promise<string[]> {
  const useKV = await initKV();

  if (useKV && kvClient && process.env.REDIS_URL) {
    try {
      // Only works with ioredis, not Vercel KV
      return await kvClient.keys(pattern);
    } catch (error) {
      console.warn('[KV] Keys failed:', error);
    }
  }

  return [];
}

/**
 * Check if KV is available
 */
export async function isKVAvailable(): Promise<boolean> {
  return await initKV();
}

