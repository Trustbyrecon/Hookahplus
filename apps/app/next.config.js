/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ensure proper output directory for Vercel
  distDir: '.next',
  // Disable static optimization for API routes to prevent path issues
  experimental: {
    outputFileTracingRoot: undefined,
  },
};

module.exports = nextConfig;


