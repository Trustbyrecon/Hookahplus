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
    const { loungeId, tableId, campaignRef } = body;

    if (!loungeId) {
      return NextResponse.json({ 
        error: 'Missing required field: loungeId' 
      }, { status: 400 });
    }

    // Special handling for Hope Global Forum - point to marketing landing page
    let targetUrl: string;
    if (loungeId === 'HOPE_GLOBAL_FORUM' || loungeId === 'hope-global-forum' || loungeId === 'HOPE') {
      targetUrl = 'https://hookahplus.net/hope';
    } else {
      // Default: Generate guest portal URL
      const guestBase = process.env.NEXT_PUBLIC_GUEST_BASE_URL || 'https://guest.hookahplus.net';
      const url = new URL(`${guestBase}/api/guest/enter`);
      url.searchParams.set('loungeId', loungeId);
      if (tableId) url.searchParams.set('tableId', tableId);
      if (campaignRef) url.searchParams.set('ref', campaignRef);
      targetUrl = url.toString();
    }

    // Generate QR code
    const qrOptions = {
      width: 512,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'M' as const,
    };

    const qrCodeData = await QRCode.toDataURL(targetUrl, qrOptions);

    const qrId = `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const qrCode: QRCodeData = {
      id: qrId,
      loungeId,
      tableId,
      campaignRef,
      url: targetUrl,
      qrCodeData,
      createdAt: now,
      usageCount: 0,
      status: 'active'
    };

    qrCodes.set(qrId, qrCode);

    console.log(`[QR Generator] New QR code created: ${qrId} - ${loungeId}${tableId ? `-${tableId}` : ''} -> ${targetUrl}`);

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

