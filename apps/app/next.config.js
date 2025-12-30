/**
 * Next.js config for apps/app
 * Note: Supabase client is now used in client components (login/signup pages)
 */

const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed webpack alias that was blocking @supabase/supabase-js imports
  // The Supabase client is now needed for client-side auth in login/signup pages
  
  // Enable instrumentation hook for server-side Sentry initialization
  experimental: {
    instrumentationHook: true,
  },
};

// Wrap with Sentry config if DSN is provided
const configWithSentry = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, {
      // Sentry webpack plugin options
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
    })
  : nextConfig;

module.exports = configWithSentry;


