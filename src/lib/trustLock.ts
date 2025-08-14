// src/lib/trustLock.ts
import crypto from "crypto";
import { env } from "../config/env";

export function trustSignature(agentId: string, intent: string) {
  const hmac = crypto.createHmac("sha256", env.TRUST_SIGNATURE_SALT);
  hmac.update(`${agentId}:${intent}`);
  return hmac.digest("hex");
}

export function sealPayload(payload: unknown) {
  const serialized = JSON.stringify(payload);
  const hmac = crypto.createHmac("sha256", env.TRUST_PAYLOAD_SEAL_SECRET);
  hmac.update(serialized);
  return { data: serialized, seal: hmac.digest("hex") };
}

export function verifySeal(data: string, seal: string) {
  const hmac = crypto.createHmac("sha256", env.TRUST_PAYLOAD_SEAL_SECRET);
  hmac.update(data);
  return crypto.timingSafeEqual(Buffer.from(seal), Buffer.from(hmac.digest("hex")));
}

export function generateTrustCursor(userId: string, sessionId: string) {
  const hmac = crypto.createHmac("sha256", env.TRUST_CURSOR_SALT);
  hmac.update(`${userId}:${sessionId}:${Date.now()}`);
  return hmac.digest("hex");
}

export function verifyTrustCursor(cursor: string, userId: string, sessionId: string, timestamp: number) {
  const hmac = crypto.createHmac("sha256", env.TRUST_CURSOR_SALT);
  hmac.update(`${userId}:${sessionId}:${timestamp}`);
  const expectedCursor = hmac.digest("hex");
  return crypto.timingSafeEqual(Buffer.from(cursor), Buffer.from(expectedCursor));
}
