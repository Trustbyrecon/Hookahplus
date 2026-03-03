import crypto from "crypto";
import { SessionSource, SessionState, type PrismaClient } from "@prisma/client";

export type ResolveMode = "create" | "join" | "rejoin" | "blocked_multi_active";

export interface ResolveSessionParticipantInput {
  loungeId: string;
  tableId: string;
  identityKey: string;
  displayName?: string;
  notMe?: boolean;
}

export interface ResolveSessionParticipantResult {
  mode: ResolveMode;
  sessionId?: string;
  participantId?: string;
  conflictSessionIds?: string[];
}

export function buildIdentityKey(opts: {
  loungeId: string;
  rawIdentity: string;
  forceNew?: boolean;
}): string {
  const base = `${opts.loungeId}:${opts.rawIdentity}`.toLowerCase();
  if (!opts.forceNew) return base;
  const suffix = crypto.randomBytes(6).toString("hex");
  return `${base}:new:${suffix}`;
}

function createTrustSignature(): string {
  const payload = `${Date.now()}:${crypto.randomBytes(16).toString("hex")}`;
  return crypto.createHash("sha256").update(payload).digest("hex");
}

export async function resolveSessionParticipant(
  prisma: PrismaClient,
  input: ResolveSessionParticipantInput
): Promise<ResolveSessionParticipantResult> {
  const { loungeId, tableId, identityKey, displayName, notMe } = input;

  const activeSessions = await prisma.session.findMany({
    where: {
      loungeId,
      tableId,
      state: SessionState.ACTIVE,
    },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  if (activeSessions.length > 1) {
    // CODIGO pilot demo: allow join to most recent session instead of blocking
    if (loungeId === "CODIGO") {
      const mostRecent = activeSessions[activeSessions.length - 1];
      const sessionId = mostRecent!.id;

      const existingParticipant = await prisma.participant.findFirst({
        where: {
          sessionId,
          identityKey,
          status: "ACTIVE",
        },
        select: { id: true },
      });

      if (existingParticipant) {
        return {
          mode: "rejoin",
          sessionId,
          participantId: existingParticipant.id,
        };
      }

      const participant = await prisma.participant.create({
        data: {
          sessionId,
          identityKey,
          displayName: displayName || "Guest",
          status: "ACTIVE",
        },
        select: { id: true },
      });

      return {
        mode: "join",
        sessionId,
        participantId: participant.id,
      };
    }

    const sessionIds = activeSessions.map((s) => s.id);
    const driftKey = `recon.session.multi_active:${loungeId}:${tableId}:${sessionIds.join(",")}`;

    await prisma.driftEvent.create({
      data: {
        drift_reason_v1: "multi_active_session_same_table",
        severity: "critical",
        action_type: "recon.session.multi_active",
        lounge_id: loungeId,
        location_id: tableId,
        evidence: {
          table_id: tableId,
          session_ids: sessionIds,
          reason: "multiple_active_sessions_detected",
        },
        risk_hints: ["operational_mapping_integrity"],
        counts_expected: 1,
        counts_observed: activeSessions.length,
        counts_delta: activeSessions.length - 1,
        idempotency_key: driftKey,
      },
    }).catch(() => {
      // Ignore duplicate idempotency writes; returning blocked response is primary behavior.
    });

    return {
      mode: "blocked_multi_active",
      conflictSessionIds: sessionIds,
    };
  }

  if (activeSessions.length === 1) {
    const sessionId = activeSessions[0].id;

    if (!notMe) {
      const existingParticipant = await prisma.participant.findFirst({
        where: {
          sessionId,
          identityKey,
          status: "ACTIVE",
        },
        select: { id: true },
      });

      if (existingParticipant) {
        return {
          mode: "rejoin",
          sessionId,
          participantId: existingParticipant.id,
        };
      }
    }

    const participant = await prisma.participant.create({
      data: {
        sessionId,
        identityKey,
        displayName: displayName || "Guest",
        status: "ACTIVE",
      },
      select: { id: true },
    });

    return {
      mode: "join",
      sessionId,
      participantId: participant.id,
    };
  }

  const created = await prisma.$transaction(async (tx) => {
    const session = await tx.session.create({
      data: {
        loungeId,
        tableId,
        source: SessionSource.QR,
        state: SessionState.ACTIVE,
        trustSignature: createTrustSignature(),
      },
      select: { id: true },
    });

    const participant = await tx.participant.create({
      data: {
        sessionId: session.id,
        identityKey,
        displayName: displayName || "Guest",
        status: "ACTIVE",
      },
      select: { id: true },
    });

    return { sessionId: session.id, participantId: participant.id };
  });

  return {
    mode: "create",
    sessionId: created.sessionId,
    participantId: created.participantId,
  };
}
