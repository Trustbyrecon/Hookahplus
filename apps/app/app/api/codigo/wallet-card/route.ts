import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const memberId = (searchParams.get('memberId') || '').trim();
    if (!memberId) {
      return NextResponse.json({ error: 'memberId is required' }, { status: 400 });
    }

    // MVP: return a dark-styled QR PNG that encodes the memberId (HID).
    // This is intentionally structured so a future `.pkpass` can replace it.
    const png = await QRCode.toBuffer(memberId, {
      errorCorrectionLevel: 'M',
      width: 900,
      margin: 2,
      color: {
        dark: '#E5E7EB', // zinc-200
        light: '#09090B', // zinc-950
      },
    });

    const safeMember = memberId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'member';

    // `NextResponse` expects a Web `BodyInit` type; wrap Buffer as Uint8Array for TS compatibility.
    const body = new Uint8Array(png);
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="CODIGO-${safeMember}.png"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('[CODIGO Wallet Card] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate wallet card' },
      { status: 500 }
    );
  }
}

