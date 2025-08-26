/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export to enable API routes
  // output: 'export',
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: true,
  // Enable image optimization
  images: {
    unoptimized: false,
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
