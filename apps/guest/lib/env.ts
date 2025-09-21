// Environment variable utilities with fallbacks for build process
export const getEnvVar = (key: string, fallback?: string): string => {
  const value = process.env[key];
  if (!value && !fallback) {
    throw new Error(`${key} is required`);
  }
  return value || fallback || '';
};

export const getSupabaseUrl = (): string => {
  return getEnvVar('SUPABASE_URL', 'https://placeholder.supabase.co');
};

export const getSupabaseAnonKey = (): string => {
  return getEnvVar('SUPABASE_ANON_KEY', 'placeholder-anon-key');
};

export const getSupabaseServiceRoleKey = (): string => {
  return getEnvVar('SUPABASE_SERVICE_ROLE_KEY', 'placeholder-service-role-key');
};

export const getStripeSecretKey = (): string => {
  return getEnvVar('STRIPE_SECRET_KEY', 'sk_test_placeholder');
};

export const getStripeWebhookSecret = (): string => {
  return getEnvVar('STRIPE_WEBHOOK_SECRET_GUEST', 'whsec_placeholder');
};

export const getPublicStripeKey = (): string => {
  return getEnvVar('NEXT_PUBLIC_STRIPE_PUBLIC_KEY', 'pk_test_placeholder');
};

export const getSiteUrl = (): string => {
  return getEnvVar('NEXT_PUBLIC_SITE_URL', 'https://placeholder.vercel.app');
};
