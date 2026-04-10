import type { NextRequest } from 'next/server';
import { clearPendingOperatorAction, getPendingOperatorAction } from './operatorConfirmation';
import { forwardCookieHeaders, getInternalBaseUrl } from './operatorHttp';
import { writeCustomerMemoryFromSession } from './operatorMemoryWriter';
import { normalizeTableId } from './operatorNormalize';
import { operatorFail, operatorSuccess } from './operatorToolResult';
import type { OperatorToolResult } from './operatorTypes';

/**
 * Run MOVE_TABLE immediately (trust auto-confirm). Same HTTP semantics as pending move execution.
 */
export async function executeMoveTableImmediate(
  sessionId: string,
  destinationTable: string,
  req: NextRequest
): Promise<OperatorToolResult> {
  const base = getInternalBaseUrl(req);
  const headers = forwardCookieHeaders(req);
  const dest = normalizeTableId(destinationTable);
  if (!sessionId || !dest) {
    return operatorFail('move_table', 'validation_error', 'Invalid session or destination for move.');
  }

  const res = await fetch(`${base}/api/sessions/${encodeURIComponent(sessionId)}/command`, {
    method: 'POST',
    headers: {
      ...headers,
      'Idempotency-Key': `${sessionId}:MOVE_TABLE:${Date.now()}`,
    },
    body: JSON.stringify({ cmd: 'MOVE_TABLE', data: { table: dest }, actor: 'agent' }),
  });
  const json = (await res.json().catch(() => ({}))) as { error?: string; session?: unknown };
  if (!res.ok) {
    return operatorFail(
      'move_table',
      'error',
      json.error || `Move failed: HTTP ${res.status}`,
      { sessionId, destinationTable: dest, httpStatus: res.status }
    );
  }

  return operatorSuccess(
    'move_table',
    `Session moved to table ${dest}.`,
    { session: json.session, raw: json },
    { sessionId, destinationTable: dest },
    `[MOVE_TABLE] session=${sessionId} → ${dest}`
  );
}

/** Close session via command API + CLARK write-back (no pending-key clear). */
export async function executeCloseSessionImmediate(
  sessionId: string,
  req: NextRequest,
  loungeId?: string
): Promise<OperatorToolResult> {
  const base = getInternalBaseUrl(req);
  const headers = forwardCookieHeaders(req);

  const res = await fetch(`${base}/api/sessions/${encodeURIComponent(sessionId)}/command`, {
    method: 'POST',
    headers: {
      ...headers,
      'Idempotency-Key': `${sessionId}:CLOSE_SESSION:${Date.now()}`,
    },
    body: JSON.stringify({ cmd: 'CLOSE_SESSION', data: {}, actor: 'agent' }),
  });
  const json = (await res.json().catch(() => ({}))) as {
    error?: string;
    session?: { tableId?: string | null; id?: string };
  };
  if (!res.ok) {
    return operatorFail(
      'end_session',
      'error',
      json.error || `Close failed: HTTP ${res.status}`,
      { sessionId, httpStatus: res.status }
    );
  }

  await writeCustomerMemoryFromSession(sessionId, loungeId);

  const tid = json.session?.tableId;
  return operatorSuccess(
    'end_session',
    `Session closed${tid ? ` (table ${tid})` : ''}.`,
    { session: json.session, raw: json },
    { sessionId },
    `[CLOSE] session=${sessionId}`
  );
}

export async function executePendingOperatorAction(
  actionKey: string,
  req: NextRequest
): Promise<OperatorToolResult> {
  const pending = getPendingOperatorAction(actionKey);
  if (!pending) {
    return operatorFail('end_session', 'not_found', 'Pending action not found or expired.');
  }

  const base = getInternalBaseUrl(req);
  const headers = forwardCookieHeaders(req);

  if (pending.tool === 'multi_step') {
    for (const step of pending.steps) {
      if (step.tool === 'move_table') {
        const sessionId = String(step.args.session_id ?? '').trim();
        const destRaw = String(step.args.destination_table ?? '').trim();
        const moveResult = await executeMoveTableImmediate(sessionId, destRaw, req);
        if (!moveResult.ok) {
          clearPendingOperatorAction(actionKey);
          return moveResult;
        }
      }
      if (step.tool === 'end_session') {
        const sessionId = String(step.args.session_id ?? '').trim();
        const closeResult = await executeCloseSessionImmediate(sessionId, req, pending.loungeId);
        if (!closeResult.ok) {
          clearPendingOperatorAction(actionKey);
          return closeResult;
        }
      }
    }
    clearPendingOperatorAction(actionKey);
    return operatorSuccess(
      'move_table',
      'Moved and closed session.',
      {
        actionKey,
        stepsExecuted: pending.steps.length,
      },
      {
        chained: true,
        actionType: 'multi_step',
      },
      `[CHAIN] multi_step complete`
    );
  }

  if (pending.tool === 'end_session') {
    const sessionId = String(pending.args.session_id ?? '').trim();
    if (!sessionId) {
      clearPendingOperatorAction(actionKey);
      return operatorFail('end_session', 'validation_error', 'Missing session id on pending action.');
    }

    const result = await executeCloseSessionImmediate(sessionId, req, pending.loungeId);
    if (!result.ok) {
      return result;
    }
    clearPendingOperatorAction(actionKey);
    return result;
  }

  if (pending.tool === 'move_table') {
    const sessionId = String(pending.args.session_id ?? '').trim();
    const destRaw = String(pending.args.destination_table ?? '').trim();
    const dest = normalizeTableId(destRaw);
    if (!sessionId || !dest) {
      clearPendingOperatorAction(actionKey);
      return operatorFail('move_table', 'validation_error', 'Invalid pending move action.');
    }

    const res = await fetch(`${base}/api/sessions/${encodeURIComponent(sessionId)}/command`, {
      method: 'POST',
      headers: {
        ...headers,
        'Idempotency-Key': `${sessionId}:MOVE_TABLE:${Date.now()}`,
      },
      body: JSON.stringify({ cmd: 'MOVE_TABLE', data: { table: dest }, actor: 'agent' }),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string; session?: unknown };
    if (!res.ok) {
      return operatorFail(
        'move_table',
        'error',
        json.error || `Move failed: HTTP ${res.status}`,
        { sessionId, destinationTable: dest }
      );
    }

    clearPendingOperatorAction(actionKey);
    return operatorSuccess(
      'move_table',
      `Session moved to table ${dest}.`,
      { session: json.session, raw: json },
      { sessionId, destinationTable: dest },
      `[MOVE_TABLE] session=${sessionId} → ${dest}`
    );
  }

  return operatorFail('end_session', 'error', 'Unsupported pending action.');
}
