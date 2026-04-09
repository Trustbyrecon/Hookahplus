import { prisma } from './db';
import { SessionState } from '@prisma/client';
import type { ResolvedSessionContext } from './operatorTypes';
import { normalizeTableId } from './operatorNormalize';

export type ResolveSessionContextArgs = {
  loungeId?: string;
  session_id?: string;
  table?: string;
  customer_name?: string;
  customer_ref?: string;
};

const ACTIVE: SessionState[] = [SessionState.PENDING, SessionState.ACTIVE, SessionState.PAUSED];

function isActiveState(s: SessionState): boolean {
  return ACTIVE.includes(s);
}

/**
 * Resolve natural references (table, customer, session id) to lounge-scoped session context.
 * Read-only — does not mutate.
 */
export async function resolveSessionContext(
  args: ResolveSessionContextArgs
): Promise<
  | ResolvedSessionContext
  | { error: string; ambiguity?: string[]; status: 'not_found' | 'ambiguous' | 'validation_error' }
> {
  const loungeId = args.loungeId?.trim();
  if (!loungeId) {
    return { error: 'Missing loungeId.', status: 'validation_error' };
  }

  if (args.session_id?.trim()) {
    const id = args.session_id.trim();
    const session = await prisma.session.findFirst({
      where: { id, loungeId },
    });
    if (!session) {
      return { error: 'No matching session for that id in this lounge.', status: 'not_found' };
    }
    return {
      loungeId,
      sessionId: session.id,
      table: session.tableId ?? undefined,
      customerRef: session.customerRef ?? undefined,
      customerName: session.customerRef ?? undefined,
      active: isActiveState(session.state),
      confidence: 'high',
    };
  }

  if (args.table?.trim()) {
    const raw = args.table.trim();
    const normalized = normalizeTableId(raw);
    const candidates = [raw, normalized].filter((x, i, a) => a.indexOf(x) === i);

    const sessions = await prisma.session.findMany({
      where: {
        loungeId,
        tableId: { in: candidates },
        state: { not: SessionState.CANCELED },
      },
      orderBy: { updatedAt: 'desc' },
      take: 12,
    });

    const actives = sessions.filter((s) => isActiveState(s.state));
    if (actives.length > 1) {
      return {
        error: 'Multiple active sessions matched this table reference.',
        status: 'ambiguous',
        ambiguity: actives.map(
          (s) => `${s.id}${s.customerRef ? ` (${s.customerRef})` : ''}${s.tableId ? ` @ ${s.tableId}` : ''}`
        ),
      };
    }
    const pick = actives[0] ?? sessions[0];
    if (!pick) {
      return { error: `No session found for table ${raw}.`, status: 'not_found' };
    }
    return {
      loungeId,
      sessionId: pick.id,
      table: pick.tableId ?? undefined,
      customerRef: pick.customerRef ?? undefined,
      customerName: pick.customerRef ?? undefined,
      active: isActiveState(pick.state),
      confidence: isActiveState(pick.state) ? 'high' : 'medium',
    };
  }

  const customerQuery = (args.customer_ref ?? args.customer_name ?? '').trim();
  if (customerQuery) {
    const sessions = await prisma.session.findMany({
      where: {
        loungeId,
        customerRef: { contains: customerQuery, mode: 'insensitive' },
        state: { not: SessionState.CANCELED },
      },
      orderBy: { updatedAt: 'desc' },
      take: 12,
    });

    if (sessions.length === 0) {
      return { error: `No session found for “${customerQuery}”.`, status: 'not_found' };
    }

    const actives = sessions.filter((s) => isActiveState(s.state));
    if (actives.length > 1) {
      return {
        error: 'Multiple active sessions matched this customer.',
        status: 'ambiguous',
        ambiguity: actives.map(
          (s) => `${s.customerRef ?? 'Guest'} — ${s.id} @ ${s.tableId ?? '?'}`
        ),
      };
    }

    const match = actives[0] ?? sessions[0];
    return {
      loungeId,
      sessionId: match.id,
      table: match.tableId ?? undefined,
      customerRef: match.customerRef ?? undefined,
      customerName: match.customerRef ?? undefined,
      active: isActiveState(match.state),
      confidence: actives.length === 1 ? 'high' : 'medium',
    };
  }

  return {
    error: 'Not enough information to resolve session context (need session id, table, or customer).',
    status: 'validation_error',
  };
}
