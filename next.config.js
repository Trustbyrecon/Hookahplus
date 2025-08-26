/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standard Next.js configuration for Netlify deployment
  reactStrictMode: true,
  swcMinify: true,
  
  // Disable ESLint during build to prevent hanging
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
