/**
 * Next.js config for apps/app
 * Note: Supabase client is now used in client components (login/signup pages)
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed webpack alias that was blocking @supabase/supabase-js imports
  // The Supabase client is now needed for client-side auth in login/signup pages
};

module.exports = nextConfig;


