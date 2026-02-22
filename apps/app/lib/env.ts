/**
 * Canonical environment accessors for apps/app runtime + tests.
 *
 * Important:
 * - Never hardcode secrets here.
 * - Provide safe defaults for local/dev/test to keep suites runnable.
 */

const DEFAULT_HID_SALT = 'hookahplus-network-salt-2025';
const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';

export function getHIDSalt(): string {
  const v = (process.env.HID_SALT ?? '').trim();
  return v || DEFAULT_HID_SALT;
}

export function getOpenAIKey(): string | null {
  const v = (process.env.OPENAI_API_KEY ?? '').trim();
  return v ? v : null;
}

export function getOpenAIModel(): string {
  const v = (process.env.OPENAI_MODEL ?? '').trim();
  return v || DEFAULT_OPENAI_MODEL;
}

export function getAppUrl(): string {
  const explicit = (process.env.NEXT_PUBLIC_APP_URL ?? '').trim();
  if (explicit) return explicit.replace(/\/$/, '');

  // Vercel provides VERCEL_URL without protocol.
  const vercelUrl = (process.env.VERCEL_URL ?? '').trim();
  if (vercelUrl) return `https://${vercelUrl}`.replace(/\/$/, '');

  return 'http://localhost:3002';
}

export function getStripeSecretKey(): string {
  const v = (process.env.STRIPE_SECRET_KEY ?? '').trim();
  if (!v) throw new Error('STRIPE_SECRET_KEY missing at runtime');
  return v;
}

export function getStripeWebhookSecret(): string {
  const v =
    (process.env.STRIPE_WEBHOOK_SECRET ?? '').trim() ||
    (process.env.STRIPE_WEBHOOK_SIGNING_SECRET ?? '').trim();
  if (!v) throw new Error('Stripe webhook secret missing (STRIPE_WEBHOOK_SECRET)');
  return v;
}

