/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Improve build resilience
  swcMinify: true,
  reactStrictMode: true,
};

module.exports = nextConfig;
