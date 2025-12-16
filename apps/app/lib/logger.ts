/**
 * Structured Logging Utility
 * Replaces console.log with structured JSON logging
 * Supports different log levels and context
 */

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

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
    name?: string;
  };
}

class Logger {
  private minLevel: LogLevel;

  constructor() {
    // Set minimum log level based on environment
    const envLevel = process.env.LOG_LEVEL?.toLowerCase();
    this.minLevel = envLevel === 'debug' ? LogLevel.DEBUG :
                    envLevel === 'info' ? LogLevel.INFO :
                    envLevel === 'warn' ? LogLevel.WARN :
                    envLevel === 'error' ? LogLevel.ERROR :
                    process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  private formatLog(level: LogLevel, message: string, context?: LogContext, error?: Error): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context && Object.keys(context).length > 0 && { context }),
      ...(error && {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
      }),
    };

    return entry;
  }

  private output(entry: LogEntry): void {
    // In production, output as JSON for log aggregation
    if (process.env.NODE_ENV === 'production' || process.env.STRUCTURED_LOGGING === 'true') {
      console.log(JSON.stringify(entry));
    } else {
      // In development, output as formatted string for readability
      const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
      const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
      const errorStr = entry.error ? `\nError: ${entry.error.message}${entry.error.stack ? `\n${entry.error.stack}` : ''}` : '';
      console.log(`${prefix} ${entry.message}${contextStr}${errorStr}`);
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.output(this.formatLog(LogLevel.DEBUG, message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.output(this.formatLog(LogLevel.INFO, message, context));
    }
  }

  warn(message: string, context?: LogContext, error?: Error): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.output(this.formatLog(LogLevel.WARN, message, context, error));
    }
  }

  error(message: string, context?: LogContext, error?: Error): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.output(this.formatLog(LogLevel.ERROR, message, context, error));
    }
  }

  /**
   * Create a child logger with default context
   */
  child(defaultContext: LogContext): Logger {
    const childLogger = new Logger();
    const originalOutput = childLogger.output.bind(childLogger);
    
    childLogger.output = (entry: LogEntry) => {
      // Merge default context with entry context
      if (entry.context) {
        entry.context = { ...defaultContext, ...entry.context };
      } else {
        entry.context = defaultContext;
      }
      originalOutput(entry);
    };

    return childLogger;
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

