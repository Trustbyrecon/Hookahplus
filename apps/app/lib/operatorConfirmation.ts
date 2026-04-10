import crypto from 'node:crypto';
import type { PendingOperatorAction, PendingOperatorStep } from './operatorTypes';

const pendingActions = new Map<string, PendingOperatorAction>();

/** Pending confirmations expire after this many ms (in-memory, single instance). */
const TTL_MS = 15 * 60 * 1000;

function pruneExpired() {
  const now = Date.now();
  for (const [key, a] of Array.from(pendingActions.entries())) {
    const t = new Date(a.createdAt).getTime();
    if (Number.isFinite(t) && now - t > TTL_MS) {
      pendingActions.delete(key);
    }
  }
}

export function createPendingOperatorAction(
  tool: 'end_session' | 'move_table',
  args: Record<string, unknown>,
  loungeId?: string
): PendingOperatorAction {
  pruneExpired();
  const actionKey = crypto.randomUUID();
  const action: PendingOperatorAction = {
    actionKey,
    tool,
    args,
    loungeId,
    createdAt: new Date().toISOString(),
  };
  pendingActions.set(actionKey, action);
  return action;
}

export function createPendingMultiStepOperatorAction(
  steps: PendingOperatorStep[],
  loungeId?: string
): PendingOperatorAction {
  pruneExpired();
  const actionKey = crypto.randomUUID();
  const action: PendingOperatorAction = {
    actionKey,
    tool: 'multi_step',
    steps,
    loungeId,
    createdAt: new Date().toISOString(),
  };
  pendingActions.set(actionKey, action);
  return action;
}

export function getPendingOperatorAction(actionKey?: string | null): PendingOperatorAction | null {
  if (!actionKey) return null;
  pruneExpired();
  return pendingActions.get(actionKey) ?? null;
}

export function clearPendingOperatorAction(actionKey?: string | null): void {
  if (!actionKey) return;
  pendingActions.delete(actionKey);
}
