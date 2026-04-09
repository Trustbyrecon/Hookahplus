import type { NextRequest } from 'next/server';
import { prisma } from './db';
import { SessionState } from '@prisma/client';

export type OperatorToolResult = {
  ok: boolean;
  tool: string;
  data?: unknown;
  error?: string;
};

function getInternalBaseUrl(req: NextRequest): string {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3002';
  const proto =
    req.headers.get('x-forwarded-proto') ||
    (host.includes('localhost') || host.startsWith('127.') ? 'http' : 'https');
  return `${proto}://${host}`;
}

function forwardHeaders(req: NextRequest): HeadersInit {
  const cookie = req.headers.get('cookie');
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (cookie) h['Cookie'] = cookie;
  return h;
}

export function normalizeTableId(raw: string): string {
  const t = raw.trim();
  if (!t) return 'UNASSIGNED';
  const digits = t.replace(/^table\s*/i, '').replace(/^t-?/i, '').trim();
  if (/^\d+$/.test(digits)) return `T-${digits}`;
  return t;
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

  const effectiveLounge = (loungeId || 'default-lounge').trim() || 'default-lounge';
  const base = getInternalBaseUrl(req);
  const headers = forwardHeaders(req);

  try {
    switch (name) {
      case 'start_session': {
        const table = typeof args.table === 'string' ? args.table : '';
        const flavors = Array.isArray(args.flavors)
          ? args.flavors.map((x) => String(x).trim()).filter(Boolean)
          : [];
        if (!table || flavors.length === 0) {
          return { ok: false, tool: name, error: 'table and flavors are required' };
        }
        const customerName =
          typeof args.customer_name === 'string' && args.customer_name.trim()
            ? args.customer_name.trim()
            : 'Guest';
        const notes = typeof args.notes === 'string' ? args.notes.trim() : '';

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
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          return {
            ok: false,
            tool: name,
            error: (json as { error?: string })?.error || `HTTP ${res.status}`,
            data: json,
          };
        }
        return { ok: true, tool: name, data: json };
      }

      case 'end_session':
      case 'move_table': {
        const sessionKey =
          typeof args.session_id === 'string' ? args.session_id.trim() : '';
        if (!sessionKey) {
          return { ok: false, tool: name, error: 'session_id is required' };
        }

        const cmd = name === 'end_session' ? 'CLOSE_SESSION' : 'MOVE_TABLE';
        const data =
          name === 'move_table'
            ? { table: normalizeTableId(typeof args.table === 'string' ? args.table : '') }
            : {};

        if (name === 'move_table' && !(data as { table: string }).table) {
          return { ok: false, tool: name, error: 'table is required for move_table' };
        }

        const res = await fetch(`${base}/api/sessions/${encodeURIComponent(sessionKey)}/command`, {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
            'Idempotency-Key': `${sessionKey}:${cmd}:${Date.now()}`,
          },
          body: JSON.stringify({ cmd, data, actor: 'agent' }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          return {
            ok: false,
            tool: name,
            error: (json as { error?: string })?.error || `HTTP ${res.status}`,
            data: json,
          };
        }
        return { ok: true, tool: name, data: json };
      }

      case 'suggest_upsell': {
        const flavors = Array.isArray(args.flavors)
          ? args.flavors.map((x) => String(x).trim()).filter(Boolean)
          : [];
        if (flavors.length === 0) {
          return { ok: false, tool: name, error: 'flavors required' };
        }
        return { ok: true, tool: name, data: suggestUpsellHeuristics(flavors) };
      }

      case 'get_customer_memory': {
        const customerName =
          typeof args.customer_name === 'string' ? args.customer_name.trim() : '';
        if (!customerName) {
          return { ok: false, tool: name, error: 'customer_name required' };
        }

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

        return {
          ok: true,
          tool: name,
          data: {
            customer: customerName,
            visits: rows.length,
            recent: summary,
          },
        };
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
          take: 5,
          select: {
            id: true,
            tableId: true,
            state: true,
            customerRef: true,
            updatedAt: true,
          },
        });

        return {
          ok: true,
          tool: name,
          data: { loungeId: effectiveLounge, activeSessionCount: active, recentSessions: recent },
        };
      }

      default:
        return { ok: false, tool: name, error: `Unknown tool: ${name}` };
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Tool execution failed';
    return { ok: false, tool: name, error: msg };
  }
}
