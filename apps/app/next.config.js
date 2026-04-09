/**
 * Next.js config for apps/app
 * Note: Supabase client is now used in client components (login/signup pages)
 */

const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed webpack alias that was blocking @supabase/supabase-js imports
  // The Supabase client is now needed for client-side auth in login/signup pages

  // CORS: allow guest app (localhost:3001) to call app API (localhost:3002)
  async headers() {
    const allowOrigin = process.env.NODE_ENV === 'production'
      ? 'https://guest.hookahplus.net'
      : 'http://localhost:3001';
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: allowOrigin },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PATCH, OPTIONS, DELETE' },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With, X-Operator-Actions-Key, X-Request-ID',
          },
        ],
      },
    ];
  },
  
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


