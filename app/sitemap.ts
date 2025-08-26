// Configure for static export
export const dynamic = 'force-static';
export const revalidate = false;

// Minimal crawl map – expand as routes grow
export default async function sitemap() {
  const base = 'https://hookahplus.net';
  const now = new Date();

  return [
    { url: `${base}/`, lastModified: now },
    { url: `${base}/demo`, lastModified: now },
    { url: `${base}/onboarding`, lastModified: now },
    { url: `${base}/dashboard/notes`, lastModified: now },
  ];
}
