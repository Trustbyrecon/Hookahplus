// lib/trustlock.ts
import crypto from "crypto";

const SECRET = process.env.TRUSTLOCK_SECRET;

// Only throw error if we're actually trying to use the functions
// This allows the module to be imported during build time
function getSecret(): string {
  if (!SECRET) {
    throw new Error("TRUSTLOCK_SECRET environment variable is required");
  }
  return SECRET;
}

export function signTrust(orderId: string): string {
  return crypto.createHmac("sha256", getSecret()).update(orderId).digest("hex");
}

export function verifyTrust(orderId: string, sig: string): boolean {
  return signTrust(orderId) === sig;
}

export function createTrustLock(orderId: string): { sig: string } {
  return { sig: signTrust(orderId) };
}
