/**
 * Simple encryption utilities for storing sensitive tokens
 * In production, consider using a more robust solution like AWS KMS or Vault
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

/**
 * Build a keyring for decrypt + a primary key for encrypt.
 *
 * Shared DB note:
 * If local + prod share the same DB, they MUST share the same ENCRYPTION_KEY
 * (or provide key rotation via *_PREVIOUS) or token decrypt will fail.
 */
function getKeyring(): Buffer[] {
  const keys: string[] = [];

  // Primary key (preferred)
  const primary = process.env.ENCRYPTION_KEY || process.env.SQUARE_ENCRYPTION_KEY;
  if (primary) keys.push(primary);

  // Optional comma-separated key list (first is primary, rest are fallbacks)
  const list = process.env.ENCRYPTION_KEYS || process.env.SQUARE_ENCRYPTION_KEYS;
  if (list) {
    keys.push(
      ...list
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
    );
  }

  // Key rotation fallbacks
  const prev = process.env.ENCRYPTION_KEY_PREVIOUS || process.env.SQUARE_ENCRYPTION_KEY_PREVIOUS;
  if (prev) keys.push(prev);
  const prev2 = process.env.ENCRYPTION_KEY_PREVIOUS_2 || process.env.SQUARE_ENCRYPTION_KEY_PREVIOUS_2;
  if (prev2) keys.push(prev2);

  // Deduplicate while preserving order
  const unique = Array.from(new Set(keys.filter(Boolean)));

  if (unique.length === 0) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ENCRYPTION_KEY must be set in production');
    }
    // Development fallback - DO NOT USE IN PRODUCTION
    console.warn('⚠️  Using default encryption key in development. Set ENCRYPTION_KEY for production.');
    return [crypto.scryptSync('default-dev-key-change-in-production', 'salt', 32)];
  }

  // Key should be 32 bytes for AES-256
  return unique.map((k) => crypto.scryptSync(k, 'square-tokens', 32));
}

/**
 * Encrypt sensitive data
 */
export function encrypt(text: string): string {
  const [key] = getKeyring();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  // Combine iv, tag, and encrypted data
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encryptedData: string): string {
  const parts = encryptedData.split(':');
  
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }

  const [ivHex, tagHex, encrypted] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');

  // Try all available keys (rotation-safe).
  const keyring = getKeyring();
  let lastErr: unknown = null;
  for (const key of keyring) {
    try {
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(tag);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (e) {
      lastErr = e;
      // Wrong key => auth fails; continue to next key.
      continue;
    }
  }

  throw new Error(
    `Unable to decrypt data with available keys. ` +
      `If you recently rotated ENCRYPTION_KEY, set ENCRYPTION_KEY_PREVIOUS (and restart the app). ` +
      `Underlying error: ${lastErr instanceof Error ? lastErr.message : String(lastErr)}`
  );
}

