import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

interface QRCodeData {
  id: string;
  loungeId: string;
  tableId?: string;
  campaignRef?: string;
  url: string;
  qrCodeData: string;
  createdAt: string;
  usageCount: number;
  lastUsed?: string;
  status: 'active' | 'inactive' | 'expired';
}

// In-memory storage for demo (in production, use database)
const qrCodes = new Map<string, QRCodeData>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { loungeId, tableId, campaignRef, targetUrl, url } = body;

    // Use targetUrl if provided, otherwise use url
    const finalUrl = targetUrl || url;

    if (!loungeId || !finalUrl) {
      return NextResponse.json({ 
        error: 'Missing required fields: loungeId and url (or targetUrl)' 
      }, { status: 400 });
    }

    // Special handling for World Shisha 2026
    let qrUrl = finalUrl;
    if (loungeId === 'WORLD_SHISHA_2026' || loungeId === 'world_shisha_2026') {
      // URL is already constructed with referral params
      qrUrl = finalUrl;
    }

    // Generate QR code
    const qrOptions = {
      width: 512,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'M' as const,
    };

    const qrCodeData = await QRCode.toDataURL(qrUrl, qrOptions);

    const qrId = body.id || `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const qrCode: QRCodeData = {
      id: qrId,
      loungeId,
      tableId,
      campaignRef,
      url: qrUrl,
      qrCodeData,
      createdAt: now,
      usageCount: 0,
      status: 'active'
    };

    qrCodes.set(qrId, qrCode);

    console.log(`[QR Generator] New QR code created: ${qrId} - ${loungeId}${tableId ? `-${tableId}` : ''}`);

    return NextResponse.json({
      success: true,
      qrCode,
      message: 'QR code generated successfully'
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
    const status = searchParams.get('status');

    let filteredQRCodes = Array.from(qrCodes.values());

    // Apply filters
    if (loungeId) {
      filteredQRCodes = filteredQRCodes.filter(qr => qr.loungeId === loungeId);
    }
    if (status) {
      filteredQRCodes = filteredQRCodes.filter(qr => qr.status === status);
    }

    // Sort by creation date (newest first)
    filteredQRCodes.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      qrCodes: filteredQRCodes,
      total: filteredQRCodes.length
    });

  } catch (error) {
    console.error('QR Generator fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch QR codes',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { qrId, action, updates } = body;

    if (!qrId) {
      return NextResponse.json({ error: 'Missing qrId' }, { status: 400 });
    }

    const qrCode = qrCodes.get(qrId);
    if (!qrCode) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 });
    }

    const now = new Date().toISOString();

    switch (action) {
      case 'update_status':
        const { status } = updates;
        if (!status) {
          return NextResponse.json({ error: 'Missing status' }, { status: 400 });
        }
        
        qrCode.status = status;
        break;

      case 'increment_usage':
        qrCode.usageCount += 1;
        qrCode.lastUsed = now;
        break;

      case 'update':
        const { loungeId, tableId, campaignRef } = updates;
        if (loungeId) qrCode.loungeId = loungeId;
        if (tableId !== undefined) qrCode.tableId = tableId;
        if (campaignRef !== undefined) qrCode.campaignRef = campaignRef;
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    qrCodes.set(qrId, qrCode);

    return NextResponse.json({
      success: true,
      message: 'QR code updated successfully',
      qrCode
    });

  } catch (error) {
    console.error('QR Generator update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update QR code',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const qrId = searchParams.get('qrId');

    if (!qrId) {
      return NextResponse.json({ error: 'Missing qrId' }, { status: 400 });
    }

    const qrCode = qrCodes.get(qrId);
    if (!qrCode) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 });
    }

    qrCodes.delete(qrId);

    console.log(`[QR Generator] QR code deleted: ${qrId}`);

    return NextResponse.json({
      success: true,
      message: 'QR code deleted successfully'
    });

  } catch (error) {
    console.error('QR Generator delete error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete QR code',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
