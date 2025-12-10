import crypto from "crypto";
import { prisma } from "@/lib/prisma";

type EventPayload = Record<string, any> | undefined | null;

const safeJsonParse = (value?: string | null) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const hashPayload = (payload: string) =>
  crypto.createHash("sha256").update(payload).digest("hex");

export async function recordSessionEvent(opts: {
  sessionId?: string | null;
  type: string;
  payload?: EventPayload;
  idempotencyKey?: string | null;
}) {
  const serializedPayload = JSON.stringify(opts.payload ?? {});
  const payloadSeal = hashPayload(serializedPayload);

  try {
    return await prisma.sessionEvent.create({
      data: {
        sessionId: opts.sessionId ?? null,
        type: opts.type,
        payload: serializedPayload,
        payloadSeal,
        data: serializedPayload,
        idempotencyKey: opts.idempotencyKey ?? null,
      },
    });
  } catch (error: any) {
    // If idempotency key already exists, return the existing event
    if (opts.idempotencyKey && error?.code === "P2002") {
      return prisma.sessionEvent.findUnique({
        where: { idempotencyKey: opts.idempotencyKey },
      });
    }
    throw error;
  }
}

export async function getSessionTimeline(sessionId: string) {
  return prisma.sessionEvent.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });
}

export async function getEventByIdempotencyKey(idempotencyKey: string) {
  return prisma.sessionEvent.findUnique({
    where: { idempotencyKey },
  });
}

export function deserializeEventPayload(payload?: string | null) {
  return safeJsonParse(payload) ?? {};
}

