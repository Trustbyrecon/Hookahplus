import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://hookahplus.net';
  const now = new Date();
  const routes = ['', '/demo', '/checkout/success', '/checkout/cancel', '/partner', '/dashboard']
    .map((path) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: path === '' ? 'weekly' : 'monthly',
      priority: path === '' ? 1 : 0.5
    }));
  return routes as MetadataRoute.Sitemap;
}
