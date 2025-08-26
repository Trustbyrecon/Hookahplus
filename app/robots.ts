// Configure for static export
export const dynamic = 'force-static';
export const revalidate = false;

// Next.js App Router robots generator
export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: 'https://hookahplus.net/sitemap.xml',
  };
}
