/**
 * Structured Logging Utility
 * 
 * Now powered by Pino for production-ready logging
 * - Fast, low-overhead logging
 * - JSON output for log aggregation (Datadog, LogRocket, etc.)
 * - Pretty printing in development
 * 
 * This file maintains backward compatibility while using Pino under the hood.
 * For new code, you can import from 'lib/logger-pino' directly.
 */

// Re-export from Pino logger for backward compatibility
export type { LogContext } from './logger-pino';
export { LogLevel, Logger, logger, log } from './logger-pino';

