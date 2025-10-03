/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Disable PostCSS processing entirely
    postcss: false,
  },
  // Disable CSS processing
  webpack: (config) => {
    config.module.rules = config.module.rules.map((rule) => {
      if (rule.test && rule.test.toString().includes('css')) {
        return {
          ...rule,
          use: ['style-loader', 'css-loader'],
        };
      }
      return rule;
    });
    return config;
  },
};

module.exports = nextConfig;