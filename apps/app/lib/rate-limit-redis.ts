import { NextRequest } from 'next/server';

/**
 * Redis-based Rate Limiting
 * Production-ready rate limiting with Redis backend
 * Falls back to in-memory store if Redis is unavailable
 */

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: string;
  retryAfter?: number;
}

// In-memory fallback store
const memoryStore = new Map<string, { count: number; resetTime: number }>();

// KV client (lazy initialization via unified client)
let kvAvailable = false;

/**
 * Initialize KV client (Vercel KV or Redis)
 */
async function initKV(): Promise<boolean> {
  if (kvAvailable) {
    return true;
  }

  const { isKVAvailable } = await import('./kv-client');
  kvAvailable = await isKVAvailable();
  return kvAvailable;
}

/**
 * Get rate limit count from KV store or memory
 */
async function getCount(key: string): Promise<{ count: number; resetTime: number } | null> {
  const useKV = await initKV();

  if (useKV) {
    try {
      const { kvGet } = await import('./kv-client');
      const data = await kvGet<{ count: number; resetTime: number }>(`ratelimit:${key}`);
      if (data) {
        return data;
      }
    } catch (error) {
      console.warn('[RateLimit] KV get failed, falling back to memory:', error);
    }
  }

  // Fallback to memory
  return memoryStore.get(key) || null;
}

/**
 * Increment rate limit count in KV store or memory
 */
async function incrementCount(
  key: string,
  windowMs: number
): Promise<{ count: number; resetTime: number }> {
  const useKV = await initKV();
  const now = Date.now();
  const resetTime = now + windowMs;

  if (useKV) {
    try {
      const redisKey = `ratelimit:${key}`;
      const current = await getCount(key);
      const count = current ? current.count + 1 : 1;

      const { kvSet } = await import('./kv-client');
      await kvSet(
        redisKey,
        { count, resetTime },
        Math.ceil(windowMs / 1000)
      );

      return { count, resetTime };
    } catch (error) {
      console.warn('[RateLimit] KV set failed, falling back to memory:', error);
    }
  }

  // Fallback to memory
  const current = memoryStore.get(key);
  const count = current ? current.count + 1 : 1;
  const entry = { count, resetTime };
  memoryStore.set(key, entry);

  // Clean up expired entries periodically
  if (memoryStore.size > 10000) {
    const now = Date.now();
    for (const [k, v] of memoryStore.entries()) {
      if (v.resetTime < now) {
        memoryStore.delete(k);
      }
    }
  }

  return entry;
}

/**
 * Create a rate limiter with Redis backend
 */
export function createRateLimit(options: Partial<RateLimitOptions> = {}) {
  const defaultOptions: RateLimitOptions = {
    windowMs: 30 * 1000, // 30 seconds
    maxRequests: 10, // 10 requests per 30 seconds
    keyGenerator: (req) => {
      const forwarded = req.headers.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
      return ip;
    },
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  };

  const opts = { ...defaultOptions, ...options };

  return async (req: NextRequest): Promise<RateLimitResult> => {
    const key = opts.keyGenerator!(req);
    const now = Date.now();

    // Get current count
    const entry = await getCount(key);

    // Check if window expired or doesn't exist
    if (!entry || entry.resetTime < now) {
      const newEntry = await incrementCount(key, opts.windowMs);
      return {
        success: true,
        limit: opts.maxRequests,
        remaining: opts.maxRequests - newEntry.count,
        resetTime: new Date(newEntry.resetTime).toISOString(),
      };
    }

    // Check if limit exceeded
    if (entry.count >= opts.maxRequests) {
      return {
        success: false,
        limit: opts.maxRequests,
        remaining: 0,
        resetTime: new Date(entry.resetTime).toISOString(),
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      };
    }

    // Increment and return
    const newEntry = await incrementCount(key, opts.windowMs);
    return {
      success: true,
      limit: opts.maxRequests,
      remaining: opts.maxRequests - newEntry.count,
      resetTime: new Date(newEntry.resetTime).toISOString(),
    };
  };
}

// Pre-configured rate limiters
export const paymentRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5, // 5 payment requests per minute
  keyGenerator: (req) => {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    return `payment:${ip}:${userAgent.slice(0, 50)}`;
  },
});

export const apiRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 API requests per minute
});

export const webhookRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 webhook requests per minute
  keyGenerator: (req) => {
    // Use Stripe signature for webhook rate limiting
    const signature = req.headers.get('stripe-signature') || 'unknown';
    return `webhook:${signature.slice(0, 20)}`;
  },
});

/**
 * Create rate limit response
 */
export function createRateLimitResponse(result: RateLimitResult) {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Rate limit exceeded',
      message: `Too many requests. Limit: ${result.limit} per window.`,
      limit: result.limit,
      remaining: result.remaining,
      resetTime: result.resetTime,
      retryAfter: result.retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.resetTime,
        'Retry-After': result.retryAfter?.toString() || '60',
      },
    }
  );
}

