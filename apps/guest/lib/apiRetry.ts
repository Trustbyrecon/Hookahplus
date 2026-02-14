/**
 * API Retry Utility with Exponential Backoff
 * Handles API failures gracefully with retry logic
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableStatuses?: number[];
  onRetry?: (attempt: number, error: any) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  onRetry: () => {},
};

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: any, retryableStatuses: number[]): boolean {
  if (!error) return false;
  
  // Network errors (fetch failures)
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  
  // HTTP status codes
  if (error.status && retryableStatuses.includes(error.status)) {
    return true;
  }
  
  // Response with status
  if (error.response?.status && retryableStatuses.includes(error.response.status)) {
    return true;
  }
  
  return false;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;
  let delay = opts.initialDelay;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on last attempt
      if (attempt === opts.maxRetries) {
        break;
      }
      
      // Check if error is retryable
      if (!isRetryableError(error, opts.retryableStatuses)) {
        throw error; // Don't retry non-retryable errors
      }
      
      // Call retry callback
      opts.onRetry(attempt + 1, error);
      
      // Wait before retrying
      await sleep(delay);
      
      // Exponential backoff
      delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelay);
    }
  }
  
  throw lastError;
}

/**
 * Fetch with retry logic
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  return retryWithBackoff(async () => {
    const response = await fetch(url, options);
    
    // Check if response is retryable
    if (!response.ok) {
      const error: any = new Error(`HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.response = response;
      
      // Only retry on retryable statuses
      if (retryOptions.retryableStatuses?.includes(response.status) || 
          DEFAULT_OPTIONS.retryableStatuses.includes(response.status)) {
        throw error;
      }
      
      // For non-retryable errors, return response anyway
      return response;
    }
    
    return response;
  }, retryOptions);
}

/**
 * API call with retry and error handling
 */
export async function apiCall<T>(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<T> {
  const response = await fetchWithRetry(url, options, retryOptions);
  
  if (!response.ok) {
    let errorMessage = `API call failed: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // If response isn't JSON, use status text
    }
    throw new Error(errorMessage);
  }
  
  return response.json();
}

/**
 * Create a retryable fetch function with default options
 */
export function createRetryableFetch(defaultRetryOptions: RetryOptions = {}) {
  return async <T>(
    url: string,
    options: RequestInit = {},
    retryOptions: RetryOptions = {}
  ): Promise<T> => {
    return apiCall<T>(url, options, { ...defaultRetryOptions, ...retryOptions });
  };
}

