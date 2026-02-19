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
  
  // Webpack configuration to handle optional dependencies
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignore puppeteer at build time (it's optional and loaded dynamically)
      const webpack = require('webpack');
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^puppeteer$/,
        })
      );
    }
    return config;
  },
};

// Wrap with Sentry webpack plugin only when fully configured.
// This avoids preview/CI builds failing when DSN is set but auth/token/org/project are not.
const sentryWebpackConfigured =
  !!process.env.SENTRY_AUTH_TOKEN && !!process.env.SENTRY_ORG && !!process.env.SENTRY_PROJECT;

const configWithSentry =
  process.env.NODE_ENV === 'production' &&
  process.env.NEXT_PUBLIC_SENTRY_DSN &&
  sentryWebpackConfigured
    ? withSentryConfig(nextConfig, {
        // Sentry webpack plugin options
        silent: true,
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
      })
    : nextConfig;

module.exports = configWithSentry;


