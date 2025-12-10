import { getEventByIdempotencyKey, recordSessionEvent, deserializeEventPayload } from "@/lib/session-events";

type IdempotencyParams<T> = {
  key?: string | null;
  sessionId?: string | null;
  sessionIdFromResult?: (result: T) => string | null | undefined;
  eventType: string;
  payload?: Record<string, any> | null;
  handler: () => Promise<T>;
};

export type IdempotentResult<T> = {
  result: T;
  cached: boolean;
};

export function extractIdempotencyKey(req: Request | { headers: Headers }): string | null {
  const headers = "headers" in req ? req.headers : new Headers();
  return (
    headers.get("Idempotency-Key") ||
    headers.get("idempotency-key") ||
    headers.get("x-idempotency-key") ||
    headers.get("X-Idempotency-Key")
  );
}

export async function withIdempotency<T>({
  key,
  sessionId,
  sessionIdFromResult,
  eventType,
  payload,
  handler,
}: IdempotencyParams<T>): Promise<IdempotentResult<T>> {
  if (key) {
    const existing = await getEventByIdempotencyKey(key);
    if (existing) {
      const stored = deserializeEventPayload(existing.payload ?? existing.data);
      const storedResult = (stored as any)?.result ?? stored;
      return { result: storedResult as T, cached: true };
    }
  }

  const result = await handler();
  const sessionRef = sessionId ?? sessionIdFromResult?.(result) ?? null;
  await recordSessionEvent({
    sessionId: sessionRef,
    type: eventType,
    payload: payload ?? { result },
    idempotencyKey: key ?? undefined,
  });

  return { result, cached: false };
}

