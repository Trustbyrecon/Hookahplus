/** @type {import('next').NextConfig} */
const isStatic = process.env.STATIC_EXPORT === 'true';
const config = {
  reactStrictMode: true,
  images: { unoptimized: isStatic },
  trailingSlash: isStatic,
  // Disable legacy font optimization since we vendor fonts
  optimizeFonts: false
};
if (isStatic) config.output = 'export';
module.exports = config;
