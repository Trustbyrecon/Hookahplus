/**
 * H+ → Recon authentication. Verifies HMAC-SHA256(shared_secret, body) in X-Recon-Signature.
 * Scope: request body + action_type allowlist. No Stripe logic in auth layer.
 */

import crypto from "crypto";

const SIGNATURE_HEADER = "X-Recon-Signature";
/** Env var name for HMAC shared key (value never committed). */
const RECON_HMAC_KEY_ENV = "RECON_SHARED_SECRET";

/**
 * Verify HMAC-SHA256 signature. Signature must be hex-encoded.
 * Returns true if secret is set and signature matches; false otherwise.
 */
export function verifyReconSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env[RECON_HMAC_KEY_ENV];
  if (!secret || !signatureHeader?.trim()) {
    return false;
  }
  const expected = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const provided = signatureHeader.trim();
  const expectedBuf = Buffer.from(expected, "hex");
  const providedBuf = Buffer.from(provided, "hex");
  if (expectedBuf.length !== providedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, providedBuf);
}

/**
 * Compute signature for outgoing requests (e.g. from H+ server calling Recon).
 */
export function signReconBody(rawBody: string): string {
  const secret = process.env[RECON_HMAC_KEY_ENV];
  if (!secret) {
    throw new Error("RECON_SHARED_SECRET not set");
  }
  return crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
}

export { SIGNATURE_HEADER, RECON_HMAC_KEY_ENV };
