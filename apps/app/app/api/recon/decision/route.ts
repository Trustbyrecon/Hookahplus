/**
 * Recon decision API: receives ActionIntent, returns decision + signed_artifact_id.
 * When REFUND_EXECUTOR=recon and decision is ALLOW, policy-core response is augmented
 * by payment-executor (called from here). Auth: HMAC-SHA256 via X-Recon-Signature.
 */

import { NextResponse } from "next/server";
import { validateActionIntent } from "@/lib/recon/validator";
import { runPolicyCore } from "@/lib/recon/policy-core";
import { verifyReconSignature, SIGNATURE_HEADER } from "@/lib/recon/auth";
import type { ActionIntent } from "@/lib/recon/contract";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const REFUND_EXECUTOR_ENV = "REFUND_EXECUTOR";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get(SIGNATURE_HEADER);
    if (!verifyReconSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Missing or invalid auth" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const validation = validateActionIntent(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid ActionIntent", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const intent = validation.data as ActionIntent;

    // Action type allowlist: refund + Square drift (sandbox-only for now)
    const isRefund = intent.action_type === "refund.request";
    const isSquareDrift = intent.action_type.startsWith("recon.square.");
    if (isSquareDrift) {
      const squareEnv = (process.env.SQUARE_ENV || "").toLowerCase();
      const allow = squareEnv === "sandbox";
      if (!allow) {
        return NextResponse.json(
          { error: "Unsupported action_type in production", action_type: intent.action_type },
          { status: 400 }
        );
      }
    } else if (!isRefund) {
      return NextResponse.json(
        { error: "Unsupported action_type", action_type: intent.action_type },
        { status: 400 }
      );
    }

    const response = await runPolicyCore(intent);

    const executor = process.env[REFUND_EXECUTOR_ENV] ?? "hookahplus";
    if (
      isRefund &&
      executor === "recon" &&
      (response.decision === "ALLOW" || response.decision === "ALLOW_WITH_REDUCTION")
    ) {
      // Call payment-executor to perform Stripe refund; attach execution_metadata to response
      const { executeRefund } = await import("@/lib/recon/payment-executor");
      const execResult = await executeRefund({
        intent,
        adjusted_amount: response.adjusted_amount,
      });
      response.execution_metadata = execResult;
    }

    return NextResponse.json(response);
  } catch (e) {
    console.error("[Recon] Decision API error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
