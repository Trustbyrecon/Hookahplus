/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standard Next.js configuration for Netlify deployment with Functions
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: true,
  // Enable experimental features for better Netlify compatibility
  experimental: {
    esmExternals: 'loose',
  },
  // Webpack configuration for native modules
  webpack: (config, { isServer }) => {
    // Handle native modules
    config.externals = config.externals || [];
    config.externals.push('fibers');
    
    return config;
  },
};

module.exports = nextConfig;
