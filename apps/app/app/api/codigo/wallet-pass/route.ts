import { NextRequest, NextResponse } from 'next/server';
import { generateCodigoPkPass } from '../../../../../lib/passkit/codigo-pass';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const memberId = (searchParams.get('memberId') || '').trim();
    if (!memberId) {
      return NextResponse.json({ error: 'memberId is required' }, { status: 400 });
    }

    const pkpass = await generateCodigoPkPass({ memberId });
    const safeMember = memberId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'member';

    // `NextResponse` expects a Web `BodyInit` type; wrap Buffer as Uint8Array for TS compatibility.
    const body = new Uint8Array(pkpass);
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="CODIGO-${safeMember}.pkpass"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    const msg = String(error?.message || 'Failed to generate wallet pass');
    const isConfig = msg.startsWith('Missing required env:');
    if (isConfig) {
      // Fail-soft until PassKit certs are configured: fall back to QR PNG so the pilot stays unblocked.
      const { searchParams } = new URL(req.url);
      const memberId = (searchParams.get('memberId') || '').trim();
      const url = new URL(`/api/codigo/wallet-card?memberId=${encodeURIComponent(memberId)}`, req.url);
      return NextResponse.redirect(url, 307);
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

