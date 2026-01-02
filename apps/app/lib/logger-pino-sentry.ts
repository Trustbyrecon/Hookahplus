/**
 * Pino-Sentry Integration
 * 
 * Sends Pino error and warn logs to Sentry for unified observability
 * 
 * Features:
 * - Error logs → Sentry events with full context
 * - Warn logs → Sentry breadcrumbs (optional, configurable)
 * - Preserves Pino's structured logging format
 * - Adds Sentry context (user, request, component) automatically
 */

import * as Sentry from '@sentry/nextjs';
import pino from 'pino';
import type { LogContext } from './logger-pino';

interface PinoLog {
  level: number;
  time: number;
  msg: string;
  [key: string]: any;
}

/**
 * Pino stream that forwards logs to Sentry
 */
class SentryPinoStream {
  write(log: string) {
    try {
      const parsed: PinoLog = JSON.parse(log);
      
      // Only send error and warn levels to Sentry
      if (parsed.level >= pino.levels.values.error) {
        this.sendError(parsed);
      } else if (parsed.level >= pino.levels.values.warn) {
        this.sendWarning(parsed);
      }
    } catch (err) {
      // If parsing fails, ignore (shouldn't happen with valid Pino logs)
    }
  }

  private sendError(log: PinoLog) {
    const { msg, err, ...context } = log;
    
    // Set Sentry context
    if (context.userId) {
      Sentry.setUser({ id: context.userId });
    }
    
    if (context.requestId) {
      Sentry.setTag('requestId', context.requestId);
    }
    
    if (context.component) {
      Sentry.setTag('component', context.component);
    }
    
    if (context.action) {
      Sentry.setTag('action', context.action);
    }
    
    // Set additional context
    Sentry.setContext('logContext', {
      ...context,
      level: pino.levels.labels[log.level],
    });
    
    // If there's an error object, capture exception
    if (err && typeof err === 'object') {
      const error = new Error(err.message || msg);
      if (err.stack) {
        error.stack = err.stack;
      }
      if (err.name) {
        error.name = err.name;
      }
      
      Sentry.captureException(error, {
        level: 'error',
        tags: {
          source: 'pino',
          component: context.component,
          action: context.action,
        },
        extra: context,
      });
    } else {
      // Otherwise, capture as message
      Sentry.captureMessage(msg || 'Error logged via Pino', {
        level: 'error',
        tags: {
          source: 'pino',
          component: context.component,
          action: context.action,
        },
        extra: context,
      });
    }
  }

  private sendWarning(log: PinoLog) {
    const { msg, ...context } = log;
    
    // Add as breadcrumb (less noisy than full events)
    Sentry.addBreadcrumb({
      message: msg,
      level: 'warning',
      category: context.component || 'pino',
      data: context,
      timestamp: log.time / 1000, // Convert to seconds
    });
    
    // Optionally send as event if configured
    // Uncomment if you want warnings to create Sentry events too
    // const shouldCreateEvent = process.env.SENTRY_LOG_WARNINGS === 'true';
    // if (shouldCreateEvent) {
    //   Sentry.captureMessage(msg, {
    //     level: 'warning',
    //     tags: {
    //       source: 'pino',
    //       component: context.component,
    //     },
    //     extra: context,
    //   });
    // }
  }
}

/**
 * Create a Pino transport that sends logs to Sentry
 * 
 * Usage:
 * ```typescript
 * const logger = pino({
 *   level: 'info',
 * }, pino.multistream([
 *   { level: 'info', stream: process.stdout }, // Console output
 *   { level: 'error', stream: new SentryPinoStream() }, // Sentry for errors
 * ]));
 * ```
 */
export const createSentryPinoStream = () => {
  // Only create stream if Sentry is configured
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return null;
  }
  
  return new SentryPinoStream();
};

/**
 * Helper to manually send a log to Sentry (for use with existing logger)
 */
export function sendPinoLogToSentry(
  level: 'error' | 'warn' | 'info' | 'debug',
  message: string,
  context?: LogContext,
  error?: Error
) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return;
  }

  // Set user context
  if (context?.userId) {
    Sentry.setUser({ id: context.userId });
  }

  // Set tags
  if (context?.requestId) {
    Sentry.setTag('requestId', context.requestId);
  }
  if (context?.component) {
    Sentry.setTag('component', context.component);
  }
  if (context?.action) {
    Sentry.setTag('action', context.action);
  }

  // Set additional context
  if (context) {
    Sentry.setContext('logContext', context);
  }

  if (level === 'error') {
    if (error) {
      Sentry.captureException(error, {
        level: 'error',
        tags: {
          source: 'pino',
          component: context?.component,
          action: context?.action,
        },
        extra: context,
      });
    } else {
      Sentry.captureMessage(message, {
        level: 'error',
        tags: {
          source: 'pino',
          component: context?.component,
          action: context?.action,
        },
        extra: context,
      });
    }
  } else if (level === 'warn') {
    Sentry.addBreadcrumb({
      message,
      level: 'warning',
      category: context?.component || 'pino',
      data: context,
    });
  }
}

