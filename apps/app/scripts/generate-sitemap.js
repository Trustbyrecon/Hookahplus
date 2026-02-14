const fs = require('fs');
const path = require('path');

// Simple sitemap generation for static pages
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hookahplus-app.vercel.app';
const pages = [
  '/',
  '/fire-session-dashboard',
  '/staff-dashboard'
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

const outputDir = path.join(process.cwd(), 'public');
const outputPath = path.join(outputDir, 'sitemap.xml');

// Create public directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, sitemap);
console.log('Sitemap generated successfully at:', outputPath);
