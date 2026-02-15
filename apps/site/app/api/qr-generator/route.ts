import { NextRequest, NextResponse } from 'next/server';

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://app.hookahplus.net'
      : 'http://localhost:3002');
}

async function forward(method: string, req: NextRequest, body?: any) {
  const appUrl = getAppUrl();
  const url = new URL(req.url);
  const path = url.pathname.replace('/api/qr-generator', '/api/qr-generator');
  const targetUrl = `${appUrl}${path}${url.search}`;

  const resp = await fetch(targetUrl, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await resp.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { success: resp.ok, message: text || `HTTP ${resp.status}` };
  }

  return NextResponse.json(data, { status: resp.status });
}

/**
 * Canonical enforcement for site build:
 * - This endpoint must NOT mint arbitrary URLs or store QR codes in-memory.
 * - It proxies to the app build `/api/qr-generator`, which itself calls `/api/admin/qr`.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  // Normalize to canonical input shape used by app build
  const loungeId = body?.loungeId;
  const tableId = body?.tableId;
  const bulkTables = body?.bulkTables;

  if (!loungeId) {
    return NextResponse.json({ success: false, error: 'Missing required field: loungeId' }, { status: 400 });
  }
  const tables = Array.isArray(bulkTables) && bulkTables.length > 0 ? bulkTables : [tableId].filter(Boolean);
  if (!tables.length) {
    return NextResponse.json({ success: false, error: 'tableId or bulkTables is required' }, { status: 400 });
  }

  return forward('POST', req, {
    loungeId,
    tableId,
    bulkTables,
    campaignRef: body?.campaignRef,
    baseUrl: body?.baseUrl,
    size: body?.size,
    format: body?.format,
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const loungeId = searchParams.get('loungeId');
  if (!loungeId) {
    return NextResponse.json({ success: false, error: 'loungeId is required' }, { status: 400 });
  }
  return forward('GET', req);
}

export async function PUT() {
  return NextResponse.json({ success: false, error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ success: false, error: 'Method not allowed' }, { status: 405 });
}
