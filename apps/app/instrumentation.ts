/**
 * Next.js Instrumentation Hook
 * 
 * This file is required for Next.js App Router to properly initialize
 * server-side Sentry configuration. It runs once when the server starts.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Import and initialize server-side Sentry config
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime configuration (if needed)
    // await import('./sentry.edge.config');
  }
}

