// Dummy PostCSS plugin to satisfy Next.js 13.5.11 hardcoded dependency
module.exports = function() {
  return {
    postcssPlugin: 'tailwindcss-postcss',
    Once(root, { result }) {
      // Do nothing - this is a dummy plugin
    }
  }
}

module.exports.postcss = true
