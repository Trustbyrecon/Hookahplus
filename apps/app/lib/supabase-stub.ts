// Build-time stub to prevent Supabase initialization errors during Vercel builds
// This file replaces @supabase/supabase-js during build process

export const createClient = () => {
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL === '1') {
    console.log('SUPABASE STUB: createClient called during Vercel build - returning null');
    return null;
  }
  
  // This should never be reached during Vercel builds
  throw new Error('Supabase stub should not be called during runtime');
};

export default {
  createClient
};
