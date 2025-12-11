/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone', // Temporarily disabled for Windows symlink issues
  images: {
    // Use unoptimized images to prevent 400 errors from image optimization API
    // This bypasses Next.js image optimization which is causing 400 errors
    unoptimized: true,
  },
}

module.exports = nextConfig
