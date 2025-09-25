const fs = require('fs');
const path = require('path');

// Simple sitemap generation for static pages
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hookahplus-pretty-archive.vercel.app';
const pages = [
  '/',
  '/sessions',
  '/staff-ops',
  '/staff-panel',
  '/admin',
  '/checkout',
  '/pre-order',
  '/landing',
  '/demo',
  '/demo-flow',
  '/roi-calculator',
  '/square-pos',
  '/admin-control',
  '/admin-customers',
  '/admin-connectors',
  '/admin-control-center',
  '/fire-session-dashboard'
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

const outputPath = path.join(process.cwd(), 'public/sitemap.xml');
fs.writeFileSync(outputPath, sitemap);
console.log('Sitemap generated successfully at:', outputPath);
