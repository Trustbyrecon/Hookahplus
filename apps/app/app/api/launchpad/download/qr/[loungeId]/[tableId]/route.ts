import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateQRCodePNG } from '@/lib/launchpad/qr-generator';

/**
 * GET /api/launchpad/download/qr/[loungeId]/[tableId]
 * Download QR code as PNG for a specific table or kiosk
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { loungeId: string; tableId: string } }
) {
  try {
    const { loungeId, tableId } = params;

    // Verify lounge exists
    const lounge = await prisma.tenant.findUnique({
      where: { id: loungeId },
    });

    if (!lounge) {
      return NextResponse.json(
        { error: 'Lounge not found' },
        { status: 404 }
      );
    }

    // Build URL based on tableId
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hookahplus.net';
    let url: string;

    if (tableId === 'kiosk') {
      url = `${baseUrl}/guest/${loungeId}/kiosk`;
    } else {
      url = `${baseUrl}/guest/${loungeId}/table/${tableId}`;
    }

    // Generate QR code as PNG buffer
    const qrBuffer = await generateQRCodePNG(url);

    // Return as PNG download
    return new NextResponse(qrBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="qr-${loungeId}-${tableId}.png"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('[Download QR] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}

