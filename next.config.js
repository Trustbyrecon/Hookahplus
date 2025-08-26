/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Disable font optimization for static export builds to avoid external requests
  optimizeFonts: false,
  // Configure static export
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
