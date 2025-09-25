// Environment variable utilities with fallbacks for build process
export const getEnvVar = (key: string, fallback?: string): string => {
  const value = process.env[key];
  if (!value && !fallback) {
    throw new Error(`${key} is required`);
  }
  return value || fallback || '';
};

export const getSupabaseUrl = (): string => {
  const value = process.env.SUPABASE_URL;
  if (!value) {
    throw new Error('SUPABASE_URL is required');
  }
  return value;
};

export const getSupabaseAnonKey = (): string => {
  const value = process.env.SUPABASE_ANON_KEY;
  if (!value) {
    throw new Error('SUPABASE_ANON_KEY is required');
  }
  return value;
};

export const getSupabaseServiceRoleKey = (): string => {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!value) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
  }
  return value;
};

export const getStripeSecretKey = (): string => {
  return getEnvVar('STRIPE_SECRET_KEY', 'sk_test_placeholder');
};

export const getStripeWebhookSecret = (): string => {
  return getEnvVar('STRIPE_WEBHOOK_SECRET', 'whsec_placeholder');
};

export const getPublicStripeKey = (): string => {
  return getEnvVar('NEXT_PUBLIC_STRIPE_PUBLIC_KEY', 'pk_test_placeholder');
};

export const getSiteUrl = (): string => {
  return getEnvVar('NEXT_PUBLIC_SITE_URL', 'https://placeholder.vercel.app');
};

export const getAppUrl = (): string => {
  return getEnvVar('NEXT_PUBLIC_APP_URL', 'https://placeholder-app.vercel.app');
};

export const getGuestUrl = (): string => {
  return getEnvVar('NEXT_PUBLIC_GUEST_URL', 'https://placeholder-guest.vercel.app');
};
