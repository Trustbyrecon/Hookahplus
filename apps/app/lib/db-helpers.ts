/**
 * Database Helper Utilities
 * Provides timeout wrappers, retry logic, and query utilities for database operations
 */

/**
 * Wrap a database query with a timeout
 * Prevents long-running queries from hanging the application
 */
export async function withQueryTimeout<T>(
  query: Promise<T>,
  timeoutMs: number = 5000
): Promise<T> {
  return Promise.race([
    query,
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Query timeout after ${timeoutMs}ms`));
      }, timeoutMs);
    }),
  ]);
}

/**
 * Execute a query with retry logic and timeout
 * Includes connection retry for database connection errors
 */
export async function withQueryRetry<T>(
  query: () => Promise<T>,
  options: {
    maxRetries?: number;
    timeoutMs?: number;
    retryDelayMs?: number;
    retryableErrors?: string[];
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    timeoutMs = 5000,
    retryDelayMs = 1000,
    retryableErrors = [
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ECONNRESET',
      'P1001', // Prisma connection error
      'P1008', // Prisma connection timeout
      'P1017', // Prisma connection closed
    ],
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await withQueryTimeout(query(), timeoutMs);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on timeout - it's likely a real issue
      if (lastError.message.includes('timeout') && !lastError.message.includes('connection')) {
        throw lastError;
      }

      // Check if error is retryable
      const isRetryable = retryableErrors.some(code => 
        lastError?.message.includes(code) || 
        (lastError as any)?.code === code ||
        (error as any)?.code === code
      );

      if (!isRetryable) {
        // Not a retryable error, throw immediately
        throw lastError;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        throw lastError;
      }

      // Wait before retrying (exponential backoff)
      const delay = retryDelayMs * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Query failed after retries');
}

/**
 * Test database connection with retry logic
 */
export async function testDatabaseConnection(
  prisma: any,
  options: {
    maxRetries?: number;
    retryDelayMs?: number;
  } = {}
): Promise<boolean> {
  const { maxRetries = 3, retryDelayMs = 1000 } = options;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1;
      
      if (isLastAttempt) {
        return false;
      }

      // Wait before retrying (exponential backoff)
      const delay = retryDelayMs * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return false;
}

/**
 * Build practical hints for Prisma connectivity failures (P1001/P1012).
 */
export function getDatabaseConnectionHints(params?: {
  databaseUrl?: string;
  directUrl?: string;
  fallbackUrl?: string;
}): string[] {
  const databaseUrl = (params?.databaseUrl || process.env.DATABASE_URL || "").trim();
  const directUrl = (params?.directUrl || process.env.DIRECT_URL || "").trim();
  const fallbackUrl = (params?.fallbackUrl || process.env.DATABASE_URL_FALLBACK || "").trim();
  const hints: string[] = [];

  hints.push("Verify DATABASE_URL is set and includes a valid connection protocol (or file: for sqlite).");

  if (databaseUrl.includes("supabase.com")) {
    if (databaseUrl.includes(":5432")) {
      hints.push("Current URL uses :5432. If this network blocks direct DB access, use a reachable pooler URL (:6543) as DATABASE_URL_FALLBACK.");
    }
    if (databaseUrl.includes(":6543")) {
      hints.push("Current URL uses :6543 pooler. For migrations, use a reachable DIRECT_URL (typically :5432).");
    }
  }

  if (!directUrl) {
    hints.push("Set DIRECT_URL for schema migrations (db push / migrate) when DATABASE_URL points to a pooler.");
  }

  if (!fallbackUrl) {
    hints.push("Optional: set DATABASE_URL_FALLBACK for local failover when primary route is unavailable.");
  }

  hints.push("Check firewall/network rules for database host:port reachability.");
  return hints;
}

/**
 * Timeout configurations for different query types
 */
export const QUERY_TIMEOUTS = {
  SIMPLE: 5000,      // 5 seconds for simple queries
  ANALYTICS: 10000,  // 10 seconds for analytics queries
  REPORTS: 30000,    // 30 seconds for complex reports
  DEFAULT: 5000,     // Default timeout
} as const;

