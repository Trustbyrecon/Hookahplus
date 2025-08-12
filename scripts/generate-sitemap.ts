import fs from 'fs';
import path from 'path';

const routes = ["/", "/dashboard", "/preorder", "/operator", "/pricing", "/waitlist", "/flavor-mix-history", "/demo/session-replay", "/integrations", "/integrations/clover", "/integrations/toast", "/docs", "/press", "/partners", "/api", "/support", "/status", "/changelog", "/security", "/accessibility", "/terms", "/privacy", "/contact", "/404", "/500"];
const BASE = process.env.SITE_ORIGIN || 'https://hookahplus.net';

const urls = routes
  .filter(r => notFile(r))
  .map(r => `<url><loc>${BASE}${r}</loc><changefreq>weekly</changefreq></url>`)
  .join('');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
  urls + `</urlset>`;

const out = path.join(process.cwd(), 'public', 'sitemap.xml');
fs.writeFileSync(out, xml);
console.log('Wrote', out);

function notFile(r) {
  return !r.endsWith('.txt') && !r.endsWith('.png') && !r.endsWith('.xml');
}
