/**
 * Pino Transport Configuration
 * 
 * Configures Pino transports for log forwarding to external services
 * 
 * Supported Transports:
 * - Console (default, always enabled)
 * - File (optional, for local log files)
 * - Datadog (optional, via HTTP API)
 * - LogRocket (optional, via HTTP API)
 * - Vercel Logs (automatic, via stdout)
 * 
 * Usage:
 * - Set environment variables to enable transports
 * - Transports are automatically configured based on env vars
 */

import pino from 'pino';

export interface TransportConfig {
  enabled: boolean;
  level?: string;
  options?: Record<string, any>;
}

/**
 * Pino stream type definition
 */
export interface PinoStream {
  level: string;
  stream: NodeJS.WritableStream | pino.TransportMultiOptions;
}

/**
 * Create transport streams based on environment configuration
 */
export function createTransportStreams(): PinoStream[] {
  const streams: PinoStream[] = [];
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isCI = process.env.CI === 'true' || !!process.env.CI;

  // CI: avoid pino transports (worker threads) to prevent Next/webpack worker resolution issues.
  if (isCI) {
    streams.push({
      level: process.env.LOG_LEVEL?.toLowerCase() || 'info',
      stream: process.stdout,
    });
    return streams;
  }

  // 1. Console/Stdout (always enabled)
  // In development: use pino-pretty for readable output
  // In production: JSON output for log aggregation
  if (isDevelopment && process.env.STRUCTURED_LOGGING !== 'true') {
    streams.push({
      level: process.env.LOG_LEVEL?.toLowerCase() || 'debug',
      stream: pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss.l',
          ignore: 'pid,hostname',
          singleLine: false,
        },
      }),
    });
  } else {
    // Production: JSON to stdout (captured by Vercel Logs)
    streams.push({
      level: process.env.LOG_LEVEL?.toLowerCase() || 'info',
      stream: process.stdout,
    });
  }

  // 2. File Transport (optional)
  if (process.env.PINO_FILE_ENABLED === 'true') {
    const filePath = process.env.PINO_FILE_PATH || './logs/app.log';
    streams.push({
      level: process.env.PINO_FILE_LEVEL || 'info',
      stream: pino.transport({
        target: 'pino/file',
        options: {
          destination: filePath,
          mkdir: true, // Create directory if it doesn't exist
        },
      }),
    });
  }

  // 3. Datadog Transport (optional)
  if (process.env.DATADOG_API_KEY && process.env.DATADOG_SITE) {
    streams.push({
      level: process.env.DATADOG_LOG_LEVEL || 'info',
      stream: pino.transport({
        target: 'pino-datadog',
        options: {
          apiKey: process.env.DATADOG_API_KEY,
          service: process.env.DATADOG_SERVICE || 'hookahplus-app',
          ddsource: 'nodejs',
          hostname: process.env.DATADOG_HOSTNAME || process.env.VERCEL_URL || 'unknown',
          env: process.env.NODE_ENV || 'development',
          ddTags: `env:${process.env.NODE_ENV || 'development'},version:${process.env.VERCEL_GIT_COMMIT_SHA || 'unknown'}`,
          intakeRegion: process.env.DATADOG_SITE || 'us1',
        },
      }),
    });
  }

  // 4. LogRocket Transport (optional)
  if (process.env.LOGROCKET_APP_ID) {
    streams.push({
      level: process.env.LOGROCKET_LOG_LEVEL || 'warn',
      stream: pino.transport({
        target: 'pino-logrocket',
        options: {
          appId: process.env.LOGROCKET_APP_ID,
          environment: process.env.NODE_ENV || 'development',
        },
      }),
    });
  }

  // 5. Custom HTTP Transport (for any HTTP-based log service)
  if (process.env.PINO_HTTP_ENABLED === 'true' && process.env.PINO_HTTP_URL) {
    try {
      const httpHeaders = process.env.PINO_HTTP_HEADERS
        ? JSON.parse(process.env.PINO_HTTP_HEADERS)
        : { 'Content-Type': 'application/json' };
      
      streams.push(createHttpStream({
        url: process.env.PINO_HTTP_URL,
        method: process.env.PINO_HTTP_METHOD || 'POST',
        headers: httpHeaders,
      }));
    } catch (err) {
      // Invalid HTTP headers JSON, skip HTTP transport
      console.warn('[Pino Transports] Invalid PINO_HTTP_HEADERS, skipping HTTP transport');
    }
  }

  return streams;
}

/**
 * Create a custom HTTP stream for log forwarding
 * Useful for services that accept HTTP POST with JSON logs
 */
function createHttpStream(config: {
  url: string;
  method?: string;
  headers?: Record<string, string>;
}): PinoStream {
  const { Writable } = require('stream');

  return {
    level: process.env.PINO_HTTP_LEVEL || 'info',
    stream: new Writable({
      write(chunk: Buffer, encoding: BufferEncoding, callback: (error?: Error | null) => void) {
        // Parse the log line
        try {
          const log = JSON.parse(chunk.toString());
          
          // Send to HTTP endpoint (async, non-blocking)
          fetch(config.url, {
            method: config.method || 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...config.headers,
            },
            body: JSON.stringify(log),
          }).catch(() => {
            // Silently fail - don't block logging
            // Note: We don't log errors here to avoid log loops
          });
        } catch (err) {
          // Invalid JSON, skip
        }
        
        callback();
      },
    }),
  };
}

/**
 * Get transport configuration summary
 */
export function getTransportSummary(): {
  enabled: string[];
  configured: string[];
} {
  const enabled: string[] = ['console'];
  const configured: string[] = ['console'];

  if (process.env.PINO_FILE_ENABLED === 'true') {
    enabled.push('file');
    configured.push('file');
  }

  if (process.env.DATADOG_API_KEY) {
    enabled.push('datadog');
    configured.push('datadog');
  }

  if (process.env.LOGROCKET_APP_ID) {
    enabled.push('logrocket');
    configured.push('logrocket');
  }

  if (process.env.PINO_HTTP_ENABLED === 'true' && process.env.PINO_HTTP_URL) {
    enabled.push('http');
    configured.push('http');
  }

  // Vercel Logs is always available (via stdout)
  configured.push('vercel-logs');

  return { enabled, configured };
}

