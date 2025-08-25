/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standard Next.js configuration for Netlify deployment
  reactStrictMode: true,
  swcMinify: true,
  // Static export for Netlify
  output: 'export',
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
