import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { QRCodeService } from '../../../lib/services/QRCodeService';

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
  branding?: {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    logoSize?: number;
  };
}

// In-memory storage for demo (in production, use database)
const qrCodes = new Map<string, QRCodeData>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { loungeId, tableId, campaignRef, branding, bulkTables } = body;

    if (!loungeId) {
      return NextResponse.json({ 
        error: 'Missing required field: loungeId' 
      }, { status: 400 });
    }

    // Handle bulk QR code generation
    if (bulkTables && Array.isArray(bulkTables) && bulkTables.length > 0) {
      const result = await QRCodeService.generateBulkQRCodes(
        loungeId,
        bulkTables,
        campaignRef,
        branding
      );

      if (result.success && result.qrCodes) {
        // Store in memory
        result.qrCodes.forEach(qr => {
          qrCodes.set(qr.id, qr);
        });

        return NextResponse.json({
          success: true,
          qrCodes: result.qrCodes,
          total: result.qrCodes.length,
          errors: result.errors,
          message: `Generated ${result.qrCodes.length} QR code(s)`
        });
      } else {
        return NextResponse.json({
          success: false,
          error: 'Failed to generate bulk QR codes',
          errors: result.errors
        }, { status: 500 });
      }
    }

    // Single QR code generation
    const result = await QRCodeService.generateQRCode({
      loungeId,
      tableId,
      campaignRef,
      branding,
    });

    if (!result.success || !result.qrCode) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to generate QR code'
      }, { status: 500 });
    }

    const qrCode = result.qrCode;
    qrCodes.set(qrCode.id, qrCode);

    console.log(`[QR Generator] New QR code created: ${qrCode.id} - ${loungeId}${tableId ? `-${tableId}` : ''} -> ${qrCode.url}`);

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

