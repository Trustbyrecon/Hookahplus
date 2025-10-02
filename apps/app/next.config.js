/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Simple configuration for Vercel deployment
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;


