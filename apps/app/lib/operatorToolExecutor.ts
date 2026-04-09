import type { NextRequest } from 'next/server';
import { SessionState } from '@prisma/client';
import { prisma } from './db';
import { createPendingOperatorAction } from './operatorConfirmation';
import { resolveSessionContext } from './operatorContextResolver';
import { forwardCookieHeaders, getInternalBaseUrl } from './operatorHttp';
import { normalizeTableId } from './operatorNormalize';
import { operatorFail, operatorNeedsConfirmation, operatorSuccess } from './operatorToolResult';
import type { OperatorToolName, OperatorToolResult } from './operatorTypes';

export { normalizeTableId } from './operatorNormalize';

function asString(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

function parseFlavorMix(row: unknown): string[] {
  if (Array.isArray(row)) return row.map((x) => String(x));
  if (typeof row === 'string') return row.split(/\s*\+\s*|,/).map((s) => s.trim()).filter(Boolean);
  return [];
}

function suggestUpsellHeuristics(flavors: string[]): {
  upsells: string[];
  premium: string[];
} {
  const f = flavors.map((x) => x.toLowerCase()).join(' ');
  const upsells: string[] = [];
  const premium: string[] = [];

  if (f.includes('mint') || f.includes('blue')) {
    upsells.push('Ice hose or chilled base for a cleaner pull');
    premium.push('Fruit head upgrade');
  }
  if (f.includes('double') || f.includes('apple')) {
    upsells.push('Add citrus accent (lemon/orange) for brightness');
  }
  upsells.push('Extra coal rotation before peak hour rush');
  premium.push('Premium bowl or HMD upgrade');

  return {
    upsells: Array.from(new Set(upsells)).slice(0, 4),
    premium: Array.from(new Set(premium)).slice(0, 3),
  };
}

const KNOWN: Set<string> = new Set([
  'resolve_session_context',
  'start_session',
  'end_session',
  'move_table',
  'suggest_upsell',
  'get_customer_memory',
  'summarize_lounge_activity',
]);

export async function executeOperatorTool(
  name: string,
  rawArgs: unknown,
  req: NextRequest,
  loungeId: string | undefined
): Promise<OperatorToolResult> {
  const args =
    rawArgs && typeof rawArgs === 'object' && !Array.isArray(rawArgs)
      ? (rawArgs as Record<string, unknown>)
      : {};

  if (!KNOWN.has(name)) {
    return operatorFail(
      'resolve_session_context',
      'validation_error',
      `Unknown tool: ${name}`
    );
  }

  const tool = name as OperatorToolName;
  const effectiveLounge = (loungeId || 'default-lounge').trim() || 'default-lounge';
  const base = getInternalBaseUrl(req);
  const headers = forwardCookieHeaders(req);

  try {
    switch (tool) {
      case 'resolve_session_context': {
        const resolved = await resolveSessionContext({
          loungeId: args.loungeId != null ? String(args.loungeId) : effectiveLounge,
          session_id: asString(args.session_id),
          table: asString(args.table),
          customer_name: asString(args.customer_name),
          customer_ref: asString(args.customer_ref),
        });

        if ('error' in resolved) {
          const st = resolved.status;
          return operatorFail(
            'resolve_session_context',
            st === 'ambiguous' ? 'ambiguous' : st === 'not_found' ? 'not_found' : 'validation_error',
            resolved.error,
            resolved.ambiguity ? { ambiguity: resolved.ambiguity } : undefined,
            `[RESOLVE] failed: ${resolved.error}`
          );
        }

        return operatorSuccess(
          'resolve_session_context',
          resolved.active
            ? `Resolved active session${resolved.table ? ` at ${resolved.table}` : ''}${resolved.customerRef ? ` (${resolved.customerRef})` : ''}.`
            : 'Resolved session context (not active).',
          resolved,
          {
            sessionId: resolved.sessionId,
            table: resolved.table,
            loungeId: resolved.loungeId,
          },
          `[RESOLVE] session=${resolved.sessionId ?? 'n/a'} table=${resolved.table ?? 'n/a'}`
        );
      }

      case 'start_session': {
        const table = asString(args.table);
        const flavors = Array.isArray(args.flavors)
          ? args.flavors.map((x) => String(x).trim()).filter(Boolean)
          : [];
        if (!table || flavors.length === 0) {
          return operatorFail(
            'start_session',
            'validation_error',
            'table and flavors are required',
            undefined,
            '[START] validation failed'
          );
        }
        const customerName = asString(args.customer_name) || 'Guest';
        const notes = asString(args.notes);

        const body = {
          tableId: normalizeTableId(table),
          customerName,
          flavor: flavors.join(' + '),
          flavorMix: flavors,
          loungeId: effectiveLounge,
          source: 'WALK_IN',
          codigoOperator: effectiveLounge === 'CODIGO',
          ...(notes ? { notes } : {}),
        };

        const res = await fetch(`${base}/api/sessions`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        });
        const json = (await res.json().catch(() => ({}))) as {
          error?: string;
          session?: { id?: string; tableId?: string | null };
        };

        if (!res.ok) {
          return operatorFail(
            'start_session',
            'error',
            json.error || `HTTP ${res.status}`,
            { httpStatus: res.status, body: json },
            `[START] failed HTTP ${res.status}`
          );
        }

        const sid = json.session?.id;
        const tid = json.session?.tableId ?? body.tableId;
        return operatorSuccess(
          'start_session',
          `Session started${tid ? ` at table ${tid}` : ''}${customerName !== 'Guest' ? ` for ${customerName}` : ''}.`,
          json,
          {
            sessionId: sid,
            tableId: tid,
            loungeId: effectiveLounge,
            customerName,
          },
          `[START] session=${sid ?? 'n/a'} table=${tid ?? 'n/a'}`
        );
      }

      case 'end_session': {
        const resolved = await resolveSessionContext({
          loungeId: effectiveLounge,
          session_id: asString(args.session_id),
          table: asString(args.table),
          customer_name: asString(args.customer_name),
          customer_ref: asString(args.customer_ref),
        });

        if ('error' in resolved) {
          const st = resolved.status;
          return operatorFail(
            'end_session',
            st === 'ambiguous' ? 'ambiguous' : st === 'not_found' ? 'not_found' : 'validation_error',
            resolved.error,
            resolved.ambiguity ? { ambiguity: resolved.ambiguity } : undefined
          );
        }

        if (!resolved.sessionId) {
          return operatorFail('end_session', 'validation_error', 'Could not resolve a session to close.');
        }

        const pending = createPendingOperatorAction(
          'end_session',
          { session_id: resolved.sessionId },
          effectiveLounge
        );

        return operatorNeedsConfirmation(
          'end_session',
          `Ready to close${resolved.table ? ` table ${resolved.table}` : ''}${resolved.customerRef ? ` (${resolved.customerRef})` : ''}.`,
          {
            required: true,
            actionKey: pending.actionKey,
            prompt: `Confirm closing session ${resolved.sessionId}${resolved.table ? ` (table ${resolved.table})` : ''}?`,
          },
          {
            sessionId: resolved.sessionId,
            table: resolved.table,
            customerRef: resolved.customerRef,
          },
          `[CLOSE?] session=${resolved.sessionId}`
        );
      }

      case 'move_table': {
        const destination =
          asString(args.destination_table) ||
          asString(args.destination) ||
          asString(args.to_table);
        if (!destination) {
          return operatorFail(
            'move_table',
            'validation_error',
            'destination_table is required (where to move the session).',
            undefined,
            '[MOVE] missing destination'
          );
        }

        const resolved = await resolveSessionContext({
          loungeId: effectiveLounge,
          session_id: asString(args.session_id),
          table: asString(args.table) || asString(args.from_table),
          customer_name: asString(args.customer_name),
          customer_ref: asString(args.customer_ref),
        });

        if ('error' in resolved) {
          const st = resolved.status;
          return operatorFail(
            'move_table',
            st === 'ambiguous' ? 'ambiguous' : st === 'not_found' ? 'not_found' : 'validation_error',
            resolved.error,
            resolved.ambiguity ? { ambiguity: resolved.ambiguity } : undefined
          );
        }

        if (!resolved.sessionId) {
          return operatorFail('move_table', 'validation_error', 'Could not resolve a session to move.');
        }

        const destNorm = normalizeTableId(destination);
        const pending = createPendingOperatorAction(
          'move_table',
          {
            session_id: resolved.sessionId,
            destination_table: destNorm,
          },
          effectiveLounge
        );

        return operatorNeedsConfirmation(
          'move_table',
          `Ready to move${resolved.table ? ` from table ${resolved.table}` : ''} to ${destNorm}.`,
          {
            required: true,
            actionKey: pending.actionKey,
            prompt: `Confirm moving session ${resolved.sessionId} to table ${destNorm}?`,
          },
          {
            sessionId: resolved.sessionId,
            fromTable: resolved.table,
            destinationTable: destNorm,
          },
          `[MOVE?] session=${resolved.sessionId} → ${destNorm}`
        );
      }

      case 'suggest_upsell': {
        const flavors = Array.isArray(args.flavors)
          ? args.flavors.map((x) => String(x).trim()).filter(Boolean)
          : [];
        if (flavors.length === 0) {
          return operatorFail('suggest_upsell', 'validation_error', 'flavors required');
        }
        const data = suggestUpsellHeuristics(flavors);
        return operatorSuccess(
          'suggest_upsell',
          'Upsell suggestions ready.',
          data,
          { flavors },
          `[UPSELL] ${flavors.join('+')}`
        );
      }

      case 'get_customer_memory': {
        const customerName = asString(args.customer_name);
        if (!customerName) {
          return operatorFail('get_customer_memory', 'validation_error', 'customer_name required');
        }

        const rollup = await prisma.customerMemory.findFirst({
          where: {
            loungeId: effectiveLounge,
            OR: [
              { customerRef: { contains: customerName, mode: 'insensitive' } },
              { customerName: { contains: customerName, mode: 'insensitive' } },
            ],
          },
          orderBy: { updatedAt: 'desc' },
        });

        const rows = await prisma.session.findMany({
          where: {
            loungeId: effectiveLounge,
            customerRef: { contains: customerName, mode: 'insensitive' },
            state: { notIn: [SessionState.CANCELED] },
          },
          orderBy: { createdAt: 'desc' },
          take: 8,
          select: {
            id: true,
            tableId: true,
            flavorMix: true,
            flavor: true,
            createdAt: true,
            customerRef: true,
          },
        });

        const summary = rows.map((r) => ({
          sessionId: r.id,
          tableId: r.tableId,
          flavors: parseFlavorMix(r.flavorMix).length
            ? parseFlavorMix(r.flavorMix)
            : r.flavor
              ? [r.flavor]
              : [],
          at: r.createdAt.toISOString(),
        }));

        return operatorSuccess(
          'get_customer_memory',
          rollup || rows.length
            ? `Found ${rows.length} session(s)${rollup ? '; saved preference rollup available' : ''}.`
            : 'No prior visits found for that name in this lounge.',
          {
            customer: customerName,
            visits: rows.length,
            recent: summary,
            rollup: rollup
              ? {
                  recentFlavors: rollup.recentFlavors,
                  preferredTable: rollup.preferredTable,
                  sessionCount: rollup.sessionCount,
                  note: rollup.note,
                }
              : null,
          },
          { loungeId: effectiveLounge },
          `[MEMORY] ${customerName}`
        );
      }

      case 'summarize_lounge_activity': {
        const activeStates: SessionState[] = [
          SessionState.PENDING,
          SessionState.ACTIVE,
          SessionState.PAUSED,
        ];
        const active = await prisma.session.count({
          where: { loungeId: effectiveLounge, state: { in: activeStates } },
        });
        const recent = await prisma.session.findMany({
          where: { loungeId: effectiveLounge },
          orderBy: { updatedAt: 'desc' },
          take: 8,
          select: {
            id: true,
            tableId: true,
            state: true,
            customerRef: true,
            updatedAt: true,
          },
        });

        const closedTonight = await prisma.session.count({
          where: {
            loungeId: effectiveLounge,
            state: SessionState.CLOSED,
            updatedAt: { gte: new Date(Date.now() - 12 * 60 * 60 * 1000) },
          },
        });

        return operatorSuccess(
          'summarize_lounge_activity',
          `${active} active session(s) in this lounge; ${closedTonight} closed in last 12h (approx).`,
          {
            loungeId: effectiveLounge,
            activeSessionCount: active,
            recentSessions: recent,
            closedApprox12h: closedTonight,
          },
          { loungeId: effectiveLounge },
          `[SUMMARY] lounge=${effectiveLounge} active=${active}`
        );
      }

      default:
        return operatorFail(tool, 'validation_error', `Unhandled tool: ${tool}`);
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Tool execution failed';
    return operatorFail(
      name as OperatorToolName,
      'error',
      msg,
      undefined,
      `[ERROR] ${name}: ${msg}`
    );
  }
}
