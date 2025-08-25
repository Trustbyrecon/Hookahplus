/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Netlify deployment
  output: 'export',
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: true,
  // Disable image optimization for static export
  images: {
    unoptimized: true,
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
