import { NextRequest, NextResponse } from 'next/server';
import { storeQRCodes, getQRCodesForLounge, retireQRCode } from '../../../lib/launchpad/qr-storage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { loungeId, tableId, campaignRef, bulkTables, baseUrl, size = 512, format = 'png' } = body;

    if (!loungeId) {
      return NextResponse.json({ 
        error: 'Missing required field: loungeId' 
      }, { status: 400 });
    }

    const adminBase = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
    const tables = Array.isArray(bulkTables) && bulkTables.length > 0
      ? bulkTables
      : [tableId].filter(Boolean);

    if (!tables.length) {
      return NextResponse.json({ error: 'tableId or bulkTables is required' }, { status: 400 });
    }

    const generated: Array<{
      tableId: string | null;
      type: 'table' | 'kiosk';
      url: string;
      qrCodeDataUrl: string;
    }> = [];

    for (const t of tables) {
      const url = new URL('/api/admin/qr', adminBase);
      url.searchParams.set('loungeId', loungeId);
      url.searchParams.set('size', String(size));
      url.searchParams.set('format', String(format));
      if (baseUrl) url.searchParams.set('baseUrl', baseUrl);
      if (campaignRef) url.searchParams.set('ref', campaignRef);
      // Canonical mapping target includes lounge + table.
      url.searchParams.set('tableId', String(t));
      const response = await fetch(url.toString(), { method: 'GET' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        return NextResponse.json({
          success: false,
          error: `Failed generating QR for table ${t}`,
          details: data?.error || 'unknown_error',
        }, { status: 500 });
      }
      generated.push({
        tableId: String(t),
        type: 'table',
        url: data.url,
        qrCodeDataUrl: data.qrDataUrl || '',
      });
    }

    await storeQRCodes(loungeId, generated);

    return NextResponse.json({
      success: true,
      total: generated.length,
      qrCodes: generated.map((q) => ({
        loungeId,
        tableId: q.tableId || undefined,
        url: q.url,
        qrCodeData: q.qrCodeDataUrl,
        status: 'active',
        usageCount: 0,
        createdAt: new Date().toISOString(),
      })),
      message: `Generated ${generated.length} durable QR code(s)`,
    });

  } catch (error) {
    console.error('QR Generator error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate QR code',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const loungeId = searchParams.get('loungeId');
    if (!loungeId) {
      return NextResponse.json({ error: 'loungeId is required' }, { status: 400 });
    }

    let stored = await getQRCodesForLounge(loungeId);

    return NextResponse.json({
      success: true,
      qrCodes: stored.map((q) => ({
        id: q.id,
        loungeId: q.loungeId,
        tableId: q.tableId || undefined,
        url: q.url,
        qrCodeData: q.qrCodeDataUrl,
        status: q.status || 'active',
        retiredAt: q.retiredAt?.toISOString() ?? null,
        createdAt: q.createdAt.toISOString(),
        updatedAt: q.updatedAt.toISOString(),
        usageCount: 0,
      })),
      total: stored.length,
    });

  } catch (error) {
    console.error('QR Generator fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch QR codes',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { loungeId, tableId, action } = body;
    if (!loungeId || !tableId || action !== 'retire') {
      return NextResponse.json({ error: 'loungeId, tableId, and action: "retire" required' }, { status: 400 });
    }
    const ok = await retireQRCode(loungeId, tableId);
    return NextResponse.json({ success: ok, message: ok ? 'QR retired' : 'QR not found' });
  } catch (error) {
    console.error('QR Generator retire error:', error);
    return NextResponse.json({ error: 'Failed to retire QR', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 });
  }
}

