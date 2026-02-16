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

