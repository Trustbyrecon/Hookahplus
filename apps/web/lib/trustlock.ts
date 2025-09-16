import crypto from 'crypto';

const TRUSTLOCK_SECRET = process.env.TRUSTLOCK_SECRET || 'super-secret-trustlock-key-fallback-for-dev';
const TRUSTLOCK_VERSION = 'TLH-v1';
const MAX_SIGNATURE_AGE_MS = 60 * 60 * 1000; // 1 hour

interface TrustPayload {
  orderId: string;
  amount: number; // in cents
  timestamp: number;
  metadata?: Record<string, any>;
}

interface TrustSignatureResult {
  signature: string;
  timestamp: number;
  version: string;
}

interface TrustVerificationResult {
  isValid: boolean;
  error?: string;
  age?: number; // in seconds
}

export function signTrust(orderId: string, amount: number, metadata?: Record<string, any>): TrustSignatureResult {
  const timestamp = Date.now();
  const payload: TrustPayload = { orderId, amount, timestamp, metadata };
  const payloadString = JSON.stringify(payload);

  const hmac = crypto.createHmac('sha256', TRUSTLOCK_SECRET);
  hmac.update(payloadString);
  const signature = hmac.digest('hex');

  auditTrustEvent('order.signed', orderId, { amount, metadata, signature: signature.substring(0, 8) + '...' });

  return { signature, timestamp, version: TRUSTLOCK_VERSION };
}

export function verifyTrust(
  orderId: string,
  receivedSignature: string,
  amount: number,
  receivedTimestamp: number,
  metadata?: Record<string, any>
): TrustVerificationResult {
  const now = Date.now();
  const age = (now - receivedTimestamp) / 1000; // age in seconds

  if (age > MAX_SIGNATURE_AGE_MS / 1000) {
    auditTrustEvent('verification.failed', orderId, { reason: 'Signature expired', age });
    return { isValid: false, error: 'Signature expired' };
  }

  const expectedPayload: TrustPayload = { orderId, amount, timestamp: receivedTimestamp, metadata };
  const expectedPayloadString = JSON.stringify(expectedPayload);

  const hmac = crypto.createHmac('sha256', TRUSTLOCK_SECRET);
  hmac.update(expectedPayloadString);
  const expectedSignature = hmac.digest('hex');

  if (expectedSignature === receivedSignature) {
    auditTrustEvent('verification.success', orderId, { amount, age });
    return { isValid: true, age };
  } else {
    auditTrustEvent('verification.failed', orderId, { reason: 'Signature mismatch', age });
    return { isValid: false, error: 'Signature mismatch' };
  }
}

export function generateClientReference(orderId: string, trustSignature: string): string {
  const truncatedSignature = trustSignature.substring(0, 16);
  return `${orderId}_${truncatedSignature}`;
}

export function parseClientReference(clientReferenceId: string): { orderId: string; truncatedSignature: string } | null {
  const parts = clientReferenceId.split('_');
  if (parts.length < 2) {
    return null;
  }
  const orderId = parts.slice(0, parts.length - 1).join('_');
  const truncatedSignature = parts[parts.length - 1];
  return { orderId, truncatedSignature };
}

export function auditTrustEvent(eventType: string, orderId: string, data: Record<string, any>) {
  console.log(`[TRUST-AUDIT] ${new Date().toISOString()} | Event: ${eventType} | Order: ${orderId} | Data: ${JSON.stringify(data)}`);
}

export function getTrustLockStatus() {
  return {
    version: TRUSTLOCK_VERSION,
    status: TRUSTLOCK_SECRET === 'super-secret-trustlock-key-fallback-for-dev' ? 'WARNING: Using default secret' : 'active',
    maxSignatureAge: `${MAX_SIGNATURE_AGE_MS / (60 * 1000)} minutes`
  };
}
