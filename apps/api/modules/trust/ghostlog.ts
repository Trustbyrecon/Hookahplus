// apps/api/modules/trust/ghostlog.ts
import crypto from "crypto";

type GhostEvent = { type: string; payload: any; ts: string; nonce: string; ghostHash: string };
const LOG: GhostEvent[] = [];

export function stamp(payload: any) {
  const ts = new Date().toISOString();
  const nonce = crypto.randomBytes(8).toString("hex");
  const raw = JSON.stringify({ payload, ts, nonce });
  const ghostHash = crypto.createHash("sha256").update(raw).digest("hex");
  return { ts, nonce, ghostHash };
}

export function append(type: string, payload: any) {
  const { ts, nonce, ghostHash } = stamp(payload);
  LOG.push({ type, payload, ts, nonce, ghostHash });
  return { ts, nonce, ghostHash };
}

export function verify(ev: GhostEvent) {
  const raw = JSON.stringify({ payload: ev.payload, ts: ev.ts, nonce: ev.nonce });
  const computed = crypto.createHash("sha256").update(raw).digest("hex");
  return computed === ev.ghostHash;
}

// For diagnostics
export function recent(limit = 20) {
  return LOG.slice(-limit);
}
