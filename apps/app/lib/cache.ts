/**
 * API Response Caching Utility
 * Provides caching layer for API responses with TTL support
 * Uses Next.js cache for server-side caching, with optional Redis support
 */

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
  revalidate?: number; // Next.js revalidation time
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// In-memory cache for development (fallback if Redis not available)
const memoryCache = new Map<string, CacheEntry<any>>();

// Cache cleanup interval (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl * 1000) {
        memoryCache.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Generate cache key from request parameters
 */
export function generateCacheKey(
  prefix: string,
  params: Record<string, any> = {}
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${JSON.stringify(params[key])}`)
    .join('&');
  
  return sortedParams 
    ? `${prefix}:${sortedParams}`
    : prefix;
}

/**
 * Get cached value
 */
export async function getCached<T>(
  key: string
): Promise<T | null> {
  // Try memory cache first
  const entry = memoryCache.get(key);
  if (entry) {
    const now = Date.now();
    if (now - entry.timestamp < entry.ttl * 1000) {
      return entry.data as T;
    }
    // Expired, remove it
    memoryCache.delete(key);
  }

  // Try KV store if available (Vercel KV or Redis)
  const { kvGet } = await import('./kv-client');
  const cached = await kvGet<CacheEntry<T>>(key);
  if (cached) {
    const now = Date.now();
    if (now - cached.timestamp < cached.ttl * 1000) {
      return cached.data as T;
    }
    // Expired, remove it
    const { kvDelete } = await import('./kv-client');
    await kvDelete(key);
  }

  return null;
}

/**
 * Set cached value
 */
export async function setCached<T>(
  key: string,
  data: T,
  options: CacheOptions = {}
): Promise<void> {
  const ttl = options.ttl || 60; // Default 60 seconds
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    ttl,
  };

  // Store in memory cache
  memoryCache.set(key, entry);

  // Store in KV store if available (Vercel KV or Redis)
  const { kvSet } = await import('./kv-client');
  await kvSet(key, entry, ttl);
}

/**
 * Invalidate cache by key or tag
 */
export async function invalidateCache(
  keyOrTag: string
): Promise<void> {
  // Remove from memory cache
  if (memoryCache.has(keyOrTag)) {
    memoryCache.delete(keyOrTag);
  }

  // Remove from KV store if available
  const { kvDelete } = await import('./kv-client');
  await kvDelete(keyOrTag);
}

/**
 * Clear all cache entries with a given prefix
 */
export async function clearCacheByPrefix(prefix: string): Promise<void> {
  // Clear from memory cache
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }

  // Clear from KV store if available (pattern matching only works with Redis, not Vercel KV)
  const { kvKeys, kvDelete } = await import('./kv-client');
  const keys = await kvKeys(`${prefix}*`);
  if (keys.length > 0) {
    await Promise.all(keys.map(k => kvDelete(k)));
  }
}

/**
 * Cache wrapper for API route handlers
 * Automatically caches responses based on request parameters
 */
export function withCache<T>(
  handler: () => Promise<T>,
  options: {
    key: string;
    ttl?: number;
    tags?: string[];
    skipCache?: boolean;
  }
): Promise<T> {
  return async (): Promise<T> => {
    // Skip cache if requested or in development with cache disabled
    if (options.skipCache || (process.env.NODE_ENV === 'development' && process.env.DISABLE_CACHE === 'true')) {
      return handler();
    }

    // Try to get from cache
    const cached = await getCached<T>(options.key);
    if (cached !== null) {
      return cached;
    }

    // Execute handler and cache result
    const result = await handler();
    await setCached(options.key, result, {
      ttl: options.ttl,
      tags: options.tags,
    });

    return result;
  };
}

/**
 * Next.js revalidate cache helper
 * Use with Next.js fetch cache options
 */
export function getNextCacheOptions(options: CacheOptions = {}) {
  return {
    next: {
      revalidate: options.revalidate || options.ttl || 60,
      tags: options.tags || [],
    },
  };
}

