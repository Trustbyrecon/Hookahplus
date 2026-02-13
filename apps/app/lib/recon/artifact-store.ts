/**
 * Append-only trust artifact store. Policy-core writes before returning response.
 */

import crypto from "crypto";
import type { ActionIntent, Decision, ReconMode } from "./contract";

const RECON_ARTIFACT_ACTION = "RECON_ARTIFACT";

export interface ArtifactRecord {
  artifact_id: string;
  action_type: string;
  intent_snapshot: Record<string, unknown>;
  decision: Decision;
  mode: ReconMode;
  timestamp: string;
  policy_version: string;
}

function hashId(payload: string): string {
  return crypto.createHash("sha256").update(payload).digest("hex").slice(0, 32);
}

/**
 * Append an artifact and return its id. Uses Prisma AuditLog for persistence.
 */
export async function appendArtifact(params: {
  intent: ActionIntent;
  decision: Decision;
  mode: ReconMode;
  policy_version?: string;
}): Promise<string> {
  const ts = new Date().toISOString();
  const policyVersion = params.policy_version ?? "v1";
  const payload = JSON.stringify({
    intent: params.intent,
    decision: params.decision,
    mode: params.mode,
    ts,
    policyVersion,
  });
  const artifact_id = hashId(payload + crypto.randomBytes(8).toString("hex"));

  const record: ArtifactRecord = {
    artifact_id,
    action_type: params.intent.action_type,
    intent_snapshot: params.intent as unknown as Record<string, unknown>,
    decision: params.decision,
    mode: params.mode,
    timestamp: ts,
    policy_version: policyVersion,
  };

  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    await prisma.auditLog.create({
      data: {
        action: RECON_ARTIFACT_ACTION,
        entityType: "recon_artifact",
        entityId: artifact_id,
        changes: JSON.stringify(record),
      },
    });
  } catch (e) {
    console.warn("[Recon] Artifact store write failed (audit log):", e);
    // Still return artifact_id so decision response can be returned; store is best-effort
  }

  return artifact_id;
}

/**
 * Lookup artifact by id (for audit). Returns null if not found.
 */
export async function getArtifact(
  artifactId: string
): Promise<ArtifactRecord | null> {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const row = await prisma.auditLog.findFirst({
      where: {
        action: RECON_ARTIFACT_ACTION,
        entityId: artifactId,
      },
      orderBy: { createdAt: "desc" },
    });
    if (!row?.changes) return null;
    const parsed = JSON.parse(row.changes) as ArtifactRecord;
    return parsed.artifact_id === artifactId ? parsed : null;
  } catch {
    return null;
  }
}
