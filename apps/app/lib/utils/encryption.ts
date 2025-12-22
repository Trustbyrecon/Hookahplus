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
 * Get encryption key from environment or generate a default (for development only)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY || process.env.SQUARE_ENCRYPTION_KEY;
  
  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ENCRYPTION_KEY must be set in production');
    }
    // Development fallback - DO NOT USE IN PRODUCTION
    console.warn('⚠️  Using default encryption key in development. Set ENCRYPTION_KEY for production.');
    return crypto.scryptSync('default-dev-key-change-in-production', 'salt', 32);
  }

  // Key should be 32 bytes for AES-256
  return crypto.scryptSync(key, 'square-tokens', 32);
}

/**
 * Encrypt sensitive data
 */
export function encrypt(text: string): string {
  const key = getEncryptionKey();
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
  const key = getEncryptionKey();
  const parts = encryptedData.split(':');
  
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }

  const [ivHex, tagHex, encrypted] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

