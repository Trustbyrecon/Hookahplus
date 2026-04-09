import type { NextRequest } from 'next/server';

export type OperatorActionsAuthResult =
  | { ok: true }
  | { ok: false; error: string; status: number };

/**
 * Server-to-server auth for Custom GPT Actions (Bearer or X-Operator-Actions-Key).
 * Set OPERATOR_ACTIONS_API_KEY in the deployment environment.
 */
export function verifyOperatorActionsApiKey(req: NextRequest): OperatorActionsAuthResult {
  const secret = process.env.OPERATOR_ACTIONS_API_KEY?.trim();
  if (!secret) {
    return {
      ok: false,
      error: 'OPERATOR_ACTIONS_API_KEY is not configured on this server',
      status: 503,
    };
  }

  const authHeader = req.headers.get('authorization')?.trim() ?? '';
  const bearer = /^Bearer\s+(.+)$/i.exec(authHeader);
  const bearerToken = bearer?.[1]?.trim();
  const headerToken = req.headers.get('x-operator-actions-key')?.trim();
  const token = bearerToken || headerToken;

  if (!token || token !== secret) {
    return { ok: false, error: 'Unauthorized', status: 401 };
  }

  return { ok: true };
}
