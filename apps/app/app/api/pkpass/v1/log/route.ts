import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const logs = Array.isArray(body?.logs) ? body.logs : [];
    if (logs.length) {
      console.log('[PassKit log]', logs.slice(0, 50));
    }
    return new NextResponse(null, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to accept logs' }, { status: 500 });
  }
}

