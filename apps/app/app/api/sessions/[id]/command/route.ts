import { NextRequest, NextResponse } from 'next/server';
import { SessionState } from '@prisma/client';
import { prisma } from '../../../../../lib/db';
import { convertPrismaSessionToFireSession } from '../../../../../lib/session-utils-prisma';
import { nextStateWithTrust } from '../../../../../lib/sessionStateMachine';
import { STATUS_TO_STAGE, STATUS_TO_TRACKER_STAGE, type FireSession, type SessionStatus, type SessionAction, type UserRole } from '../../../../../types/enhancedSession';

function actorToUserRole(actor: string | undefined): UserRole {
  switch (actor) {
    case 'boh':
      return 'BOH';
    case 'foh':
      return 'FOH';
    case 'system':
      return 'ADMIN';
    case 'agent':
    default:
      return 'MANAGER';
  }
}

function mapStatusToPrismaState(status: SessionStatus): SessionState {
  // Prisma enum is coarse (PENDING/ACTIVE/PAUSED/CLOSED/CANCELED).
  // We persist detailed workflow to `stage` and `action`.
  switch (status) {
    case 'NEW':
    case 'PAID_CONFIRMED':
      return SessionState.PENDING;
    case 'STAFF_HOLD':
      return SessionState.PAUSED;
    case 'CLOSED':
      return SessionState.CLOSED;
    case 'VOIDED':
    case 'FAILED_PAYMENT':
    case 'REFUNDED':
      return SessionState.CANCELED;
    default:
      // Workflow states (prep → deliver → active)
      return SessionState.ACTIVE;
  }
}

function appendNote(existing: string | null | undefined, line: string) {
  const base = (existing || '').trim();
  if (!base) return line;
  if (base.includes(line)) return base;
  return `${base}\n${line}`;
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const sessionKey = params.id;

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const cmd = (body?.cmd as string | undefined)?.trim();
  const data = body?.data ?? {};
  const actor = (body?.actor as string | undefined) ?? 'agent';

  if (!cmd) {
    return NextResponse.json({ error: 'Missing cmd' }, { status: 400 });
  }

  const dbSession = await prisma.session.findFirst({
    where: {
      OR: [{ id: sessionKey }, { externalRef: sessionKey }, { tableId: sessionKey }],
    },
  });

  if (!dbSession) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const current: FireSession = convertPrismaSessionToFireSession(dbSession);
  const userRole: UserRole = actorToUserRole(actor);
  const operatorId = typeof data?.operatorId === 'string' ? data.operatorId : actor;

  // Non-state-changing commands (side effects / metadata)
  if (cmd === 'MOVE_TABLE') {
    const table = data?.table;
    if (!table || typeof table !== 'string') {
      return NextResponse.json({ error: 'Missing data.table for MOVE_TABLE' }, { status: 400 });
    }

    const updatedDb = await prisma.session.update({
      where: { id: dbSession.id },
      data: {
        tableId: table,
        tableNotes: appendNote(dbSession.tableNotes, `[${new Date().toISOString()}] MOVE_TABLE → ${table} (${userRole})`),
      },
    });

    const fire = convertPrismaSessionToFireSession(updatedDb);
    return NextResponse.json({ ok: true, new_state: fire.status, session: fire });
  }

  if (cmd === 'ADD_COAL_SWAP') {
    // Treat coal swaps as a side-effect marker; do not force a status change.
    const updatedDb = await prisma.session.update({
      where: { id: dbSession.id },
      data: {
        tableNotes: appendNote(dbSession.tableNotes, `[${new Date().toISOString()}] COAL_SWAP requested (${userRole})`),
      },
    });
    const fire = convertPrismaSessionToFireSession(updatedDb);
    return NextResponse.json({ ok: true, new_state: fire.status, session: fire });
  }

  // Map orchestrator commands → internal actions
  let action: SessionAction | null = null;
  if (
    cmd === 'CLAIM_PREP' ||
    cmd === 'HEAT_UP' ||
    cmd === 'READY_FOR_DELIVERY' ||
    cmd === 'DELIVER_NOW' ||
    cmd === 'MARK_DELIVERED' ||
    cmd === 'START_ACTIVE' ||
    cmd === 'CLOSE_SESSION'
  ) {
    action = cmd as SessionAction;
  } else if (cmd === 'REMAKE') {
    action = 'REQUEST_REMAKE';
  }

  // Special: STOCK_BLOCKED is a first-class status in the UI, but not a state-machine action.
  if (cmd === 'STOCK_BLOCKED') {
    const updated: FireSession = {
      ...current,
      status: 'STOCK_BLOCKED',
      currentStage: STATUS_TO_STAGE['STOCK_BLOCKED'],
      updatedAt: Date.now(),
    };

    const trackerStage = STATUS_TO_TRACKER_STAGE[updated.status as SessionStatus];
    const updatedDb = await prisma.session.update({
      where: { id: dbSession.id },
      data: {
        state: mapStatusToPrismaState(updated.status),
        stage: trackerStage,
        action: 'STOCK_BLOCKED',
        edgeCase: 'STOCK_BLOCKED',
        edgeNote: typeof data?.sku === 'string' ? `sku=${data.sku}` : dbSession.edgeNote,
        tableNotes: appendNote(
          dbSession.tableNotes,
          `[${new Date().toISOString()}] STOCK_BLOCKED${typeof data?.sku === 'string' ? ` sku=${data.sku}` : ''} (${userRole})`
        ),
      } as any,
    });

    const fire = convertPrismaSessionToFireSession(updatedDb);
    return NextResponse.json({ ok: true, new_state: fire.status, session: fire });
  }

  if (!action) {
    return NextResponse.json({ error: `Unknown cmd: ${cmd}` }, { status: 400 });
  }

  try {
    const next = nextStateWithTrust(
      current,
      { type: action, operatorId, timestamp: Date.now() },
      userRole
    );

    const trackerStage = STATUS_TO_TRACKER_STAGE[next.status as SessionStatus];
    const noteLine = `[${new Date().toISOString()}] ${cmd} (${userRole})`;

    const updatedDb = await prisma.session.update({
      where: { id: dbSession.id },
      data: {
        state: mapStatusToPrismaState(next.status),
        stage: trackerStage,
        action: cmd,
        tableNotes: appendNote(dbSession.tableNotes, noteLine),
      } as any,
    });

    const fire = convertPrismaSessionToFireSession(updatedDb);
    return NextResponse.json({ ok: true, new_state: fire.status, session: fire });
  } catch (e: any) {
    const msg = e?.message || 'Command failed';
    const status =
      typeof msg === 'string' && msg.includes('Invalid transition')
        ? 409
        : typeof msg === 'string' && msg.includes('Insufficient permissions')
          ? 423
          : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

