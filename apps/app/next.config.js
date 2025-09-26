/**
 * Next.js config for apps/app
 * Aliases @supabase/supabase-js to a noop to avoid any accidental bundling during build.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    // Prevent any import of supabase client from being bundled/executed in this app
    config.resolve.alias['@supabase/supabase-js'] = false;
    return config;
  },
};

module.exports = nextConfig;


