import * as Sentry from '@sentry/nextjs';

const isProduction = process.env.NODE_ENV === 'production';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: isProduction && !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance monitoring
  // Sample 10% of transactions in production, 100% in development
  tracesSampleRate: isProduction ? 0.1 : 0,
  
  // Session Replay - capture all error sessions, sample 10% of normal sessions
  replaysOnErrorSampleRate: isProduction ? 1.0 : 0,
  replaysSessionSampleRate: isProduction ? 0.1 : 0,
  
  // Debug mode is intentionally off (production-only sending)
  debug: false,
  
  // Environment tracking
  environment: process.env.NODE_ENV || 'development',
  
  // Release tracking for better error grouping
  release: process.env.NEXT_PUBLIC_APP_VERSION || process.env.VERCEL_GIT_COMMIT_SHA || `launchpad-${Date.now()}`,
  
  // Integrations
  integrations: [
    Sentry.replayIntegration({
      // Privacy: mask all text and block media
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
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
      // Ignore network errors that are likely transient
      if (error.message.includes('fetch') && error.message.includes('Failed to fetch')) {
        return null;
      }
    }
    
    return event;
  },
  
  // Ignore specific errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'originalCreateNotification',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    'atomicFindClose',
    // Network errors
    'NetworkError',
    'Network request failed',
    // Third-party scripts
    'fb_xd_fragment',
    'bmi_SafeAddOnload',
    'EBCallBackMessageReceived',
  ],
});

