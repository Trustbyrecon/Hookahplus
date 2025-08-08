import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: 'https://hookahplus.net/sitemap.xml',
    host: 'https://hookahplus.net',
  };
}
