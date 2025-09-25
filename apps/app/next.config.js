/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer, dev }) => {
    // During Vercel builds, replace @supabase/supabase-js with our stub
    if (isServer && process.env.NODE_ENV === 'production' && process.env.VERCEL === '1') {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@supabase/supabase-js': require.resolve('./lib/supabase-stub.ts')
      };
    }
    return config;
  },
  experimental: {
    // Ensure dynamic imports work correctly
    esmExternals: 'loose'
  }
};

module.exports = nextConfig;