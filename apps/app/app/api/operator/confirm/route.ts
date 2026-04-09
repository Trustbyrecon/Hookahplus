import { NextRequest, NextResponse } from 'next/server';
import { executePendingOperatorAction } from '../../../../lib/operatorPendingExecution';

export const runtime = 'nodejs';

/** Confirms a pending end_session or move_table action (same body as chat confirm shortcut). */
export async function POST(req: NextRequest) {
  let body: { actionKey?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const actionKey = typeof body.actionKey === 'string' ? body.actionKey.trim() : '';
  if (!actionKey) {
    return NextResponse.json({ error: 'actionKey is required' }, { status: 400 });
  }

  const result = await executePendingOperatorAction(actionKey, req);
  const status = result.ok ? 200 : result.status === 'not_found' ? 404 : 400;
  return NextResponse.json({ result }, { status });
}
