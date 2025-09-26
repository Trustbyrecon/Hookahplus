import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Proxy guests -> app live-test so only APP needs Stripe secret
export async function POST(req: Request) {
  try {
    const admin = process.env.ADMIN_TEST_TOKEN || '';
    const appBase = process.env.NEXT_PUBLIC_APP_URL || '';
    if (!appBase) {
      return NextResponse.json({ ok: false, error: 'NEXT_PUBLIC_APP_URL missing' }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const res = await fetch(`${appBase}/api/payments/live-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': admin,
      },
      body: JSON.stringify({ ...body, source: body?.source ?? 'guests:$1-smoke' }),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'proxy error' }, { status: 500 });
  }
}
