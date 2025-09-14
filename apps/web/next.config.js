const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Disable ESLint during build to prevent hanging
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Configure path mapping for monorepo
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '..', '..'), // Points to main directory
    };
    return config;
  },
  
  // Enable experimental features if needed
  experimental: {
    // Add any experimental features here
  },
};

export default nextConfig;
