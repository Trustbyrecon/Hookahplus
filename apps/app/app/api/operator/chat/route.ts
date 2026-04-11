import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Legacy in-app operator chat + OpenAI tool loop removed (Apr 2026).
 * H+ Operator GPT + `/api/operator/actions/*` is the control plane.
 */
export async function POST(req: NextRequest) {
  let body: { confirmedActionKey?: string; messages?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const legacyConfirm =
    typeof body.confirmedActionKey === 'string' ? body.confirmedActionKey.trim() : '';

  if (legacyConfirm) {
    return NextResponse.json(
      {
        deprecated: true,
        error: 'confirmedActionKey on /api/operator/chat is retired.',
        migrateTo: 'POST /api/operator/confirm',
        body: { actionKey: legacyConfirm },
      },
      { status: 410 }
    );
  }

  return NextResponse.json(
    {
      deprecated: true,
      error:
        'In-app H+ Operator chat is retired. Use H+ Operator GPT (OpenAI Actions) against /api/operator/actions/*.',
      actions: '/api/operator/actions/*',
      confirm: '/api/operator/confirm',
    },
    { status: 410 }
  );
}
