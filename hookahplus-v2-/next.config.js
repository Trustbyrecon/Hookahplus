const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standard Next.js configuration for Netlify deployment
  reactStrictMode: true,
  
  // Disable ESLint during build to prevent hanging
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Configure path mapping
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    };
    return config;
  },
};

module.exports = nextConfig;
