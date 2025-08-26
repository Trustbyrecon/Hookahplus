/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Configure static export
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
