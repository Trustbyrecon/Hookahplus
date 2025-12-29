import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance monitoring
  // Sample 10% of transactions in production, 100% in development
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Debug mode only in development
  debug: process.env.NODE_ENV === 'development',
  
  // Environment tracking
  environment: process.env.NODE_ENV || 'development',
  
  // Release tracking for better error grouping
  release: process.env.NEXT_PUBLIC_APP_VERSION || process.env.VERCEL_GIT_COMMIT_SHA || undefined,
  
  // Server-side integrations
  integrations: [
    Sentry.httpIntegration({
      // Track HTTP requests
      tracing: true,
    }),
  ],
  
  // Filter out noise and health checks
  beforeSend(event, hint) {
    // Don't send events if DSN is not configured
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
      return null;
    }
    
    // Filter out health check endpoints
    if (event.request?.url?.includes('/api/health')) {
      return null;
    }
    
    // Filter out known non-critical errors
    const error = hint.originalException;
    if (error instanceof Error) {
      // Ignore database connection errors that are likely transient
      if (error.message.includes('Can\'t reach database server') || 
          error.message.includes('Connection pool')) {
        // Still log, but don't spam Sentry
        return null;
      }
    }
    
    return event;
  },
  
  // Ignore specific errors
  ignoreErrors: [
    // Prisma connection errors (handled by retry logic)
    'P1001',
    'P1017',
  ],
});

