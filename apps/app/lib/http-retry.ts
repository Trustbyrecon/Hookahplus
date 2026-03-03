/**
 * HTTP Request Retry Utility
 * Provides retry logic for external API calls (Stripe, etc.)
 */

export interface RetryOptions {
  maxRetries?: number;
  retryDelayMs?: number;
  retryableStatusCodes?: number[];
  retryableErrors?: string[];
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_RETRYABLE_STATUS_CODES = [
  408, // Request Timeout
  429, // Too Many Requests
  500, // Internal Server Error
  502, // Bad Gateway
  503, // Service Unavailable
  504, // Gateway Timeout
];

const DEFAULT_RETRYABLE_ERRORS = [
  'ECONNREFUSED',
  'ETIMEDOUT',
  'ENOTFOUND',
  'ECONNRESET',
  'ECONNABORTED',
];

/**
 * Execute an HTTP request with retry logic
 */
export async function withHttpRetry<T>(
  request: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelayMs = 1000,
    retryableStatusCodes = DEFAULT_RETRYABLE_STATUS_CODES,
    retryableErrors = DEFAULT_RETRYABLE_ERRORS,
    onRetry,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await request();
    } catch (error: any) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if error is retryable
      const statusCode = error?.status || error?.statusCode || error?.response?.status;
      const errorCode = error?.code || error?.errno;
      
      const isRetryableStatusCode = statusCode && retryableStatusCodes.includes(statusCode);
      const isRetryableError = errorCode && retryableErrors.includes(errorCode);
      const isNetworkError = lastError.message.includes('fetch failed') || 
                            lastError.message.includes('network') ||
                            lastError.message.includes('timeout');

      const shouldRetry = isRetryableStatusCode || isRetryableError || isNetworkError;

      if (!shouldRetry) {
        // Not a retryable error, throw immediately
        throw lastError;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        throw lastError;
      }

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }

      // Wait before retrying (exponential backoff)
      const delay = retryDelayMs * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Request failed after retries');
}

/**
 * Retry wrapper specifically for Stripe API calls
 */
export async function withStripeRetry<T>(
  request: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  return withHttpRetry(request, {
    maxRetries: 3,
    retryDelayMs: 1000,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
    retryableErrors: ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET'],
    ...options,
  });
}

