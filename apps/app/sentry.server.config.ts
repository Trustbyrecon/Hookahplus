import * as Sentry from '@sentry/nextjs';

const isProduction = process.env.NODE_ENV === 'production';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: isProduction && !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance monitoring
  // Sample 10% of transactions in production, 100% in development
  tracesSampleRate: isProduction ? 0.1 : 0,
  
  // Debug mode is intentionally off (production-only sending)
  debug: false,
  
  // Environment tracking
  environment: process.env.NODE_ENV || 'development',
  
  // Release tracking for better error grouping
  release: process.env.NEXT_PUBLIC_APP_VERSION || process.env.VERCEL_GIT_COMMIT_SHA || `launchpad-${Date.now()}`,
  
  // Server-side integrations
  integrations: [
    Sentry.httpIntegration(),
    // consoleIntegration removed - not available in @sentry/nextjs
    // Console logs are captured automatically via breadcrumbs
  ],
  
  // Filter out noise and health checks
  beforeSend(event, hint) {
    // Production-only: never send events from local dev/staging unless you explicitly opt-in.
    if (!isProduction) {
      return null;
    }

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

