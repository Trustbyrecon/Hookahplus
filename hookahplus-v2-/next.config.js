/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standard Next.js configuration for Netlify deployment
  reactStrictMode: true,
  swcMinify: true,
  // Ensure proper static export for Netlify
  trailingSlash: true,
  // Handle native modules
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
