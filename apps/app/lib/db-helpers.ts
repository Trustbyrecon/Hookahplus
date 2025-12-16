/**
 * Database Helper Utilities
 * Provides timeout wrappers and query utilities for database operations
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
 */
export async function withQueryRetry<T>(
  query: () => Promise<T>,
  options: {
    maxRetries?: number;
    timeoutMs?: number;
    retryDelayMs?: number;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    timeoutMs = 5000,
    retryDelayMs = 1000,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await withQueryTimeout(query(), timeoutMs);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on timeout - it's likely a real issue
      if (lastError.message.includes('timeout')) {
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
 * Timeout configurations for different query types
 */
export const QUERY_TIMEOUTS = {
  SIMPLE: 5000,      // 5 seconds for simple queries
  ANALYTICS: 10000,  // 10 seconds for analytics queries
  REPORTS: 30000,    // 30 seconds for complex reports
  DEFAULT: 5000,     // Default timeout
} as const;

