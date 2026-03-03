import { NextRequest, NextResponse } from 'next/server';
import { loadSetupSession } from '../../../../../lib/launchpad/session-manager';
import { generateQRCodePack } from '../../../../../lib/launchpad/qr-generator';
import { generateLoungeOpsConfig } from '../../../../../lib/launchpad/config-generator';

/**
 * GET /api/launchpad/preview/qr
 * Preview QR codes for ManyChat (before lounge is created)
 * Requires token query parameter
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Load setup session
    const progress = await loadSetupSession(token);
    if (!progress) {
      return NextResponse.json(
        { error: 'Setup session not found or expired' },
        { status: 404 }
      );
    }

    // Generate config from progress
    const config = generateLoungeOpsConfig(progress);

    // Use temporary lounge ID for preview
    const tempLoungeId = `preview-${token.substring(0, 8)}`;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hookahplus.net';

    // Generate QR codes
    const qrPack = await generateQRCodePack(config, tempLoungeId, baseUrl);

    // Return preview data (data URLs for ManyChat to display)
    return NextResponse.json({
      success: true,
      preview: true,
      loungeName: progress.data.step1?.loungeName || 'Your Lounge',
      qrCodes: {
        tables: qrPack.tableQRCodes.map(qr => ({
          tableId: qr.tableId,
          dataUrl: qr.qrCodeDataUrl,
          url: qr.url,
          note: 'Preview - QR codes will be functional after Go Live',
        })),
        kiosk: {
          dataUrl: qrPack.kioskQRCode.qrCodeDataUrl,
          url: qrPack.kioskQRCode.url,
          note: 'Preview - QR code will be functional after Go Live',
        },
      },
      message: 'These are preview QR codes. Complete LaunchPad to get functional QR codes.',
    });
  } catch (error: any) {
    console.error('[Preview QR] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate preview QR codes' },
      { status: 500 }
    );
  }
}

