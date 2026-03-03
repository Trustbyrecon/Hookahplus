/**
 * Canonical environment accessors for apps/app runtime + tests.
 *
 * Important:
 * - Never hardcode secrets here.
 * - Provide safe defaults for local/dev/test to keep suites runnable.
 */

const DEFAULT_HID_SALT = 'hookahplus-network-salt-2025';
const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';

function parseBoolEnv(value: string | undefined | null): boolean | null {
  const v = (value ?? '').trim().toLowerCase();
  if (!v) return null;
  if (v === '1' || v === 'true' || v === 'yes' || v === 'on') return true;
  if (v === '0' || v === 'false' || v === 'no' || v === 'off') return false;
  return null;
}

export function getHIDSalt(): string {
  const v = (process.env.HID_SALT ?? '').trim();
  return v || DEFAULT_HID_SALT;
}

/**
 * Paid LLM usage gate.
 *
 * - Defaults to OFF in production to control spend.
 * - Enable explicitly via OPENAI_ENABLED=true when ready.
 */
export function isOpenAIEnabled(): boolean {
  const parsed = parseBoolEnv(process.env.OPENAI_ENABLED);
  if (parsed !== null) return parsed;
  return process.env.NODE_ENV !== 'production';
}

export function getOpenAIKey(): string | null {
  if (!isOpenAIEnabled()) return null;
  const v = (process.env.OPENAI_API_KEY ?? '').trim();
  return v ? v : null;
}

export function getOpenAIModel(): string {
  const v = (process.env.OPENAI_MODEL ?? '').trim();
  return v || DEFAULT_OPENAI_MODEL;
}

/**
 * Aliethia/venue-identity agent surface gate.
 *
 * - Defaults to OFF until baseline + lift are proven.
 * - Enable explicitly with ALIETHIA_ENABLED=true and a rollout allowlist.
 */
export function isAliethiaEnabled(): boolean {
  const parsed = parseBoolEnv(process.env.ALIETHIA_ENABLED);
  if (parsed !== null) return parsed;
  return false;
}

export function getAliethiaRolloutLoungeIds(): Set<string> {
  const raw = (process.env.ALIETHIA_ROLLOUT_LOUNGE_IDS ?? '').trim();
  if (!raw) return new Set();
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

export function isAliethiaEnabledForLounge(loungeId: string): boolean {
  if (!isAliethiaEnabled()) return false;
  const ids = getAliethiaRolloutLoungeIds();
  if (ids.size === 0) return true; // explicit enable, no allowlist => enable all
  return ids.has(loungeId);
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

