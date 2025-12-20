import { NextRequest, NextResponse } from 'next/server';
import { QRCodeService } from '../../../../lib/services/QRCodeService';

/**
 * GET /api/qr-generator/analytics?qrCodeId=...
 * Get analytics for a specific QR code
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const qrCodeId = searchParams.get('qrCodeId');
    const loungeId = searchParams.get('loungeId');

    if (!qrCodeId && !loungeId) {
      return NextResponse.json({
        success: false,
        error: 'Missing qrCodeId or loungeId parameter'
      }, { status: 400 });
    }

    if (qrCodeId) {
      // Get analytics for specific QR code
      const result = await QRCodeService.getAnalytics(qrCodeId);
      
      if (!result.success) {
        return NextResponse.json({
          success: false,
          error: result.error
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        analytics: result.analytics
      });
    }

    // Get analytics for all QR codes in a lounge
    // TODO: Implement lounge-level analytics aggregation
    return NextResponse.json({
      success: true,
      analytics: [],
      message: 'Lounge-level analytics coming soon'
    });

  } catch (error) {
    console.error('[QR Analytics API] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * POST /api/qr-generator/analytics/track
 * Track a QR code scan
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { qrCodeId, deviceId } = body;

    if (!qrCodeId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: qrCodeId'
      }, { status: 400 });
    }

    const result = await QRCodeService.trackScan(qrCodeId, deviceId);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Scan tracked successfully'
    });

  } catch (error) {
    console.error('[QR Analytics API] Error tracking scan:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to track scan',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

