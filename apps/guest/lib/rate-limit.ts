import { NextRequest } from 'next/server';

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

const defaultOptions: RateLimitOptions = {
  windowMs: 30 * 1000, // 30 seconds
  maxRequests: 10, // 10 requests per 30 seconds
  keyGenerator: (req) => {
    // Use IP address as default key
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    return ip;
  },
  skipSuccessfulRequests: false,
  skipFailedRequests: false
};

export function createRateLimit(options: Partial<RateLimitOptions> = {}) {
  const opts = { ...defaultOptions, ...options };
  
  return (req: NextRequest) => {
    const key = opts.keyGenerator!(req);
    const now = Date.now();
    const windowStart = now - opts.windowMs;
    
    // Clean up expired entries
    Array.from(rateLimitStore.entries()).forEach(([k, v]) => {
      if (v.resetTime < now) {
        rateLimitStore.delete(k);
      }
    });
    
    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);
    if (!entry || entry.resetTime < now) {
      entry = { count: 0, resetTime: now + opts.windowMs };
      rateLimitStore.set(key, entry);
    }
    
    // Check if limit exceeded
    if (entry.count >= opts.maxRequests) {
      const resetTime = new Date(entry.resetTime);
      return {
        success: false,
        limit: opts.maxRequests,
        remaining: 0,
        resetTime: resetTime.toISOString(),
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      };
    }
    
    // Increment counter
    entry.count++;
    
    return {
      success: true,
      limit: opts.maxRequests,
      remaining: opts.maxRequests - entry.count,
      resetTime: new Date(entry.resetTime).toISOString()
    };
  };
}

// Pre-configured rate limiters for different endpoints
export const paymentRateLimit = createRateLimit({
  windowMs: 30 * 1000, // 30 seconds
  maxRequests: 5, // 5 payment requests per 30 seconds
  keyGenerator: (req) => {
    // Use IP + user agent for payment endpoints
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    return `payment:${ip}:${userAgent.slice(0, 50)}`;
  }
});

export const apiRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 API requests per minute
});

// Utility function to create rate limit response
export function createRateLimitResponse(rateLimitResult: ReturnType<ReturnType<typeof createRateLimit>>) {
  return new Response(
    JSON.stringify({
      ok: false,
      error: 'Rate limit exceeded',
      details: {
        limit: rateLimitResult.limit,
        remaining: rateLimitResult.remaining,
        resetTime: rateLimitResult.resetTime,
        retryAfter: rateLimitResult.retryAfter
      }
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.resetTime,
        'Retry-After': rateLimitResult.retryAfter?.toString() || '60'
      }
    }
  );
}
