import { AsyncLocalStorage } from 'async_hooks';

/**
 * Request Context Utility
 * Provides request-scoped storage for request ID and other context data
 * Uses AsyncLocalStorage for request correlation across async operations
 */

interface RequestContext {
  requestId: string;
  userId?: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
}

const requestContextStorage = new AsyncLocalStorage<RequestContext>();

/**
 * Get the current request context
 */
export function getRequestContext(): RequestContext | undefined {
  return requestContextStorage.getStore();
}

/**
 * Get the current request ID
 */
export function getRequestId(): string | undefined {
  return requestContextStorage.getStore()?.requestId;
}

/**
 * Run a function with request context
 */
export function runWithContext<T>(context: RequestContext, fn: () => T): T {
  return requestContextStorage.run(context, fn);
}

/**
 * Run an async function with request context
 */
export async function runWithContextAsync<T>(
  context: RequestContext,
  fn: () => Promise<T>
): Promise<T> {
  return requestContextStorage.run(context, fn);
}

/**
 * Create request context from headers
 */
export function createRequestContext(
  requestId: string,
  headers?: Headers | Record<string, string | null>
): RequestContext {
  const context: RequestContext = {
    requestId,
  };

  if (headers) {
    const getHeader = (name: string): string | undefined => {
      if (headers instanceof Headers) {
        return headers.get(name) || undefined;
      }
      return headers[name] || undefined;
    };

    context.ip = getHeader('x-forwarded-for')?.split(',')[0] || getHeader('x-real-ip');
    context.userAgent = getHeader('user-agent');
  }

  return context;
}

export { requestContextStorage };

