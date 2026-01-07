/**
 * Pino-based Structured Logging
 * Production-ready logging with JSON output for log aggregation
 * 
 * Features:
 * - Fast, low-overhead logging
 * - JSON output for log aggregation (Datadog, LogRocket, etc.)
 * - Pretty printing in development
 * - Log levels: debug, info, warn, error
 * - Child loggers with context
 */

import pino from 'pino';
import { sendPinoLogToSentry } from './logger-pino-sentry';
import { createTransportStreams } from './logger-pino-transports';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  [key: string]: any;
}

// Create Pino logger instance
const createPinoLogger = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const logLevel = process.env.LOG_LEVEL?.toLowerCase() || (isDevelopment ? 'debug' : 'info');

  const baseConfig: pino.LoggerOptions = {
    level: logLevel,
    base: {
      env: process.env.NODE_ENV || 'development',
      service: 'hookahplus-app',
      version: process.env.APP_VERSION || process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
  };

  // Use multistream if transports are configured
  const transportStreams = createTransportStreams();
  
  // If multiple transports configured, use multistream
  if (transportStreams.length > 1) {
    // Convert PinoStream[] to StreamEntry[] format expected by multistream
    const streamEntries = transportStreams.map(({ level, stream }) => ({
      level,
      stream: stream as pino.DestinationStream,
    }));
    return pino(baseConfig, pino.multistream(streamEntries));
  }

  // Single transport (console/stdout)
  if (transportStreams.length === 1) {
    return pino(baseConfig, transportStreams[0].stream as pino.DestinationStream);
  }

  // Fallback: default console output
  // In development, use pretty printing
  if (isDevelopment && process.env.STRUCTURED_LOGGING !== 'true') {
    return pino(
      baseConfig,
      pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss.l',
          ignore: 'pid,hostname',
        },
      })
    );
  }

  // In production, use JSON output for log aggregation
  return pino(baseConfig);
};

// Create base logger
const baseLogger = createPinoLogger();

/**
 * Logger class that wraps Pino with our custom interface
 */
export class Logger {
  private pinoLogger: pino.Logger;

  constructor(pinoLogger: pino.Logger = baseLogger) {
    this.pinoLogger = pinoLogger;
  }

  private enrichContext(context?: LogContext): Record<string, any> {
    if (!context) return {};
    
    const enriched: Record<string, any> = {};
    
    // Standard fields
    if (context.requestId) enriched.requestId = context.requestId;
    if (context.userId) enriched.userId = context.userId;
    if (context.sessionId) enriched.sessionId = context.sessionId;
    if (context.component) enriched.component = context.component;
    if (context.action) enriched.action = context.action;
    
    // Additional context fields
    Object.keys(context).forEach(key => {
      if (!['requestId', 'userId', 'sessionId', 'component', 'action'].includes(key)) {
        enriched[key] = context[key];
      }
    });
    
    return enriched;
  }

  debug(message: string, context?: LogContext): void {
    this.pinoLogger.debug(this.enrichContext(context), message);
  }

  info(message: string, context?: LogContext): void {
    this.pinoLogger.info(this.enrichContext(context), message);
  }

  warn(message: string, context?: LogContext, error?: Error): void {
    const enriched = this.enrichContext(context);
    if (error) {
      enriched.err = {
        message: error.message,
        stack: error.stack,
        name: error.name,
      };
    }
    this.pinoLogger.warn(enriched, message);
    
    // Send to Sentry (as breadcrumb, less noisy)
    sendPinoLogToSentry('warn', message, context, error);
  }

  error(message: string, context?: LogContext, error?: Error): void {
    const enriched = this.enrichContext(context);
    if (error) {
      enriched.err = {
        message: error.message,
        stack: error.stack,
        name: error.name,
      };
    }
    this.pinoLogger.error(enriched, message);
    
    // Send to Sentry (as error event)
    sendPinoLogToSentry('error', message, context, error);
  }

  /**
   * Create a child logger with default context
   */
  child(defaultContext: LogContext): Logger {
    const childLogger = this.pinoLogger.child(this.enrichContext(defaultContext));
    return new Logger(childLogger);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const log = {
  debug: (message: string, context?: LogContext) => logger.debug(message, context),
  info: (message: string, context?: LogContext) => logger.info(message, context),
  warn: (message: string, context?: LogContext, error?: Error) => logger.warn(message, context, error),
  error: (message: string, context?: LogContext, error?: Error) => logger.error(message, context, error),
};

// Export Pino logger for advanced usage
export { baseLogger as pinoLogger };

