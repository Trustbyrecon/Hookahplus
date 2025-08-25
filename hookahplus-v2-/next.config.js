/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standard Next.js configuration for Netlify deployment
  reactStrictMode: true,
  swcMinify: true,
  // Remove static export to support API routes
  trailingSlash: true,
  // Handle native modules
  experimental: {
    esmExternals: 'loose',
    // Enable API routes
    appDir: true,
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
