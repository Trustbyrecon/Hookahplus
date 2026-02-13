/**
 * H+ client: build ActionIntent, call Recon decision API, return response.
 * Used by refund flow to get decision (and optional execution_metadata when Recon executes).
 * When RECON_SHARED_SECRET is set, sends X-Recon-Signature (HMAC-SHA256 of body).
 */

import type { ActionIntent, ReconDecisionResponse } from "./contract";
import { signReconBody, SIGNATURE_HEADER } from "./auth";

const REFUND_EXECUTOR_ENV = "REFUND_EXECUTOR";

export function getRefundExecutor(): "hookahplus" | "recon" {
  const v = process.env[REFUND_EXECUTOR_ENV];
  return v === "recon" ? "recon" : "hookahplus";
}

/**
 * Call Recon decision API. Base URL defaults to same origin (e.g. /api/recon/decision).
 * Signs body with RECON_SHARED_SECRET when set.
 */
export async function requestReconDecision(
  intent: ActionIntent,
  baseUrl?: string
): Promise<ReconDecisionResponse> {
  const url =
    baseUrl ?? process.env.RECON_DECISION_URL ?? "/api/recon/decision";
  const fullUrl = url.startsWith("http") ? url : `${getOrigin()}${url}`;

  const bodyStr = JSON.stringify(intent);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  try {
    headers[SIGNATURE_HEADER] = signReconBody(bodyStr);
  } catch {
    // RECON_SHARED_SECRET not set; Recon will reject if it requires auth
  }

  const res = await fetch(fullUrl, {
    method: "POST",
    headers,
    body: bodyStr,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Recon decision failed: ${res.status} ${err}`);
  }

  return res.json() as Promise<ReconDecisionResponse>;
}

function getOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXTAUTH_URL ?? "http://localhost:3002";
}
