/**
 * Sentry Instrumentation Helpers
 * 
 * Provides reusable functions for instrumenting UI actions and API calls
 * with Sentry spans for better observability and tracing.
 * 
 * Aligned with Moat Spark Doctrine: Trust Observability as a portable system.
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Instrument UI actions with Sentry spans
 * Use this in React components for button clicks, form submissions, etc.
 * 
 * @param component - Component name (e.g., 'session', 'payment', 'refill')
 * @param action - Action name (e.g., 'create', 'update', 'delete')
 * @param callback - Function to execute within the span
 * @param context - Optional context attributes to add to the span
 * @returns Result of the callback function
 * 
 * @example
 * ```typescript
 * function handleRefillRequest() {
 *   return instrumentUIAction(
 *     'refill',
 *     'request',
 *     (span) => {
 *       span.setAttribute('sessionId', sessionId);
 *       return requestRefill(sessionId);
 *     },
 *     { sessionId, userId }
 *   );
 * }
 * ```
 */
export function instrumentUIAction<T>(
  component: string,
  action: string,
  callback: (span: any) => T | Promise<T>,
  context?: Record<string, any>
): T | Promise<T> {
  // If Sentry is not available, just execute the callback
  if (!Sentry) {
    return callback(null);
  }

  return Sentry.startSpan(
    {
      op: 'ui.click',
      name: `${component}.${action}`,
    },
    (span) => {
      // Add standard attributes
      span.setAttribute('component', component);
      span.setAttribute('action', action);
      
      // Add custom context
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            span.setAttribute(key, String(value));
          }
        });
      }

      return callback(span);
    }
  );
}

/**
 * Instrument API calls with Sentry spans
 * Use this for fetch calls, API routes, etc.
 * 
 * @param endpoint - API endpoint (e.g., '/api/sessions/123')
 * @param method - HTTP method (e.g., 'GET', 'POST', 'PUT', 'DELETE')
 * @param fetchFn - Function that returns a fetch Promise
 * @param context - Optional context attributes to add to the span
 * @returns Response from the fetch call
 * 
 * @example
 * ```typescript
 * async function fetchSessionData(sessionId: string) {
 *   return instrumentAPICall(
 *     `/api/sessions/${sessionId}`,
 *     'GET',
 *     () => fetch(`/api/sessions/${sessionId}`),
 *     { sessionId }
 *   );
 * }
 * ```
 */
export async function instrumentAPICall<T extends Response>(
  endpoint: string,
  method: string,
  fetchFn: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  // If Sentry is not available, just execute the fetch
  if (!Sentry) {
    return fetchFn();
  }

  return Sentry.startSpan(
    {
      op: 'http.client',
      name: `${method} ${endpoint}`,
    },
    async (span) => {
      const startTime = Date.now();
      
      // Add standard HTTP attributes
      span.setAttribute('http.method', method);
      span.setAttribute('http.url', endpoint);
      
      // Add custom context
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            span.setAttribute(key, String(value));
          }
        });
      }

      try {
        const response = await fetchFn();
        const responseTime = Date.now() - startTime;
        
        // Add response attributes
        span.setAttribute('http.status_code', response.status);
        span.setAttribute('http.response_time', responseTime);
        span.setAttribute('http.ok', response.ok);
        
        // Mark as error if status is not ok
        if (!response.ok) {
          span.setAttribute('error', true);
          span.setAttribute('error.type', 'http_error');
          span.setAttribute('error.status_code', response.status);
        }
        
        return response;
      } catch (error) {
        const responseTime = Date.now() - startTime;
        span.setAttribute('http.response_time', responseTime);
        span.setAttribute('error', true);
        span.setAttribute('error.type', 'network_error');
        
        if (error instanceof Error) {
          span.setAttribute('error.message', error.message);
          span.setAttribute('error.name', error.name);
        } else {
          span.setAttribute('error.message', 'Unknown error');
        }
        
        throw error;
      }
    }
  );
}

/**
 * Instrument database operations with Sentry spans
 * Use this for database queries, transactions, etc.
 * 
 * @param operation - Database operation name (e.g., 'query', 'transaction', 'migration')
 * @param query - Query name or description
 * @param callback - Function to execute within the span
 * @param context - Optional context attributes to add to the span
 * @returns Result of the callback function
 * 
 * @example
 * ```typescript
 * async function getSession(sessionId: string) {
 *   return instrumentDatabaseOperation(
 *     'query',
 *     'getSession',
 *     async (span) => {
 *       span.setAttribute('db.table', 'Session');
 *       return db.session.findUnique({ where: { id: sessionId } });
 *     },
 *     { sessionId }
 *   );
 * }
 * ```
 */
export async function instrumentDatabaseOperation<T>(
  operation: string,
  query: string,
  callback: (span: any) => T | Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  // If Sentry is not available, just execute the callback
  if (!Sentry) {
    return callback(null);
  }

  return Sentry.startSpan(
    {
      op: 'db.query',
      name: `${operation}.${query}`,
    },
    async (span) => {
      const startTime = Date.now();
      
      // Add standard database attributes
      span.setAttribute('db.operation', operation);
      span.setAttribute('db.query', query);
      
      // Add custom context
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            span.setAttribute(key, String(value));
          }
        });
      }

      try {
        const result = await callback(span);
        const responseTime = Date.now() - startTime;
        
        span.setAttribute('db.response_time', responseTime);
        
        return result;
      } catch (error) {
        const responseTime = Date.now() - startTime;
        span.setAttribute('db.response_time', responseTime);
        span.setAttribute('error', true);
        span.setAttribute('error.type', 'database_error');
        
        if (error instanceof Error) {
          span.setAttribute('error.message', error.message);
          span.setAttribute('error.name', error.name);
        }
        
        throw error;
      }
    }
  );
}

/**
 * Create a custom span for any operation
 * Use this for operations that don't fit the above patterns
 * 
 * @param operation - Operation type (e.g., 'ui.action', 'background.job', 'cache.read')
 * @param name - Operation name (e.g., 'processPayment', 'sendEmail')
 * @param callback - Function to execute within the span
 * @param context - Optional context attributes to add to the span
 * @returns Result of the callback function
 * 
 * @example
 * ```typescript
 * async function processPayment(paymentId: string) {
 *   return createCustomSpan(
 *     'payment.process',
 *     'processPayment',
 *     async (span) => {
 *       span.setAttribute('payment.id', paymentId);
 *       return await stripe.charges.create({ amount: 1000 });
 *     },
 *     { paymentId }
 *   );
 * }
 * ```
 */
export async function createCustomSpan<T>(
  operation: string,
  name: string,
  callback: (span: any) => T | Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  // If Sentry is not available, just execute the callback
  if (!Sentry) {
    return callback(null);
  }

  return Sentry.startSpan(
    {
      op: operation,
      name: name,
    },
    async (span) => {
      // Add custom context
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            span.setAttribute(key, String(value));
          }
        });
      }

      return callback(span);
    }
  );
}

