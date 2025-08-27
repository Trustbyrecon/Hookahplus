/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static export to allow server-side rendering
  // output: 'export', // Commented out to fix useContext errors
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: true,
  
  // Enable image optimization
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
