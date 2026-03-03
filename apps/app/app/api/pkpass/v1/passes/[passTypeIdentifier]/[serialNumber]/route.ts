import { NextRequest, NextResponse } from 'next/server';
import { generateCodigoPkPass } from '@/lib/passkit/codigo-pass';
import { getCodigoPassLastUpdatedAt } from '@/lib/passkit/last-updated';
import { assertApplePassAuthOrThrow, requirePassTypeIdentifierOrThrow } from '@/lib/passkit/webservice';

function httpDate(d: Date): string {
  return d.toUTCString();
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ passTypeIdentifier: string; serialNumber: string }> }
) {
  try {
    const { passTypeIdentifier, serialNumber } = await ctx.params;
    requirePassTypeIdentifierOrThrow(passTypeIdentifier);
    assertApplePassAuthOrThrow({ authorizationHeader: req.headers.get('authorization'), serialNumber });

    const lastUpdated = await getCodigoPassLastUpdatedAt(serialNumber);
    const ifModifiedSince = req.headers.get('if-modified-since');
    if (ifModifiedSince) {
      const since = new Date(ifModifiedSince);
      if (!Number.isNaN(since.getTime()) && lastUpdated.getTime() <= since.getTime()) {
        return new NextResponse(null, {
          status: 304,
          headers: {
            'Last-Modified': httpDate(lastUpdated),
          },
        });
      }
    }

    const pkpass = await generateCodigoPkPass({ memberId: serialNumber });
    const body = new Uint8Array(pkpass);
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="CODIGO-${serialNumber}.pkpass"`,
        'Cache-Control': 'no-store',
        'Last-Modified': httpDate(lastUpdated),
      },
    });
  } catch (error: any) {
    const status = Number(error?.status) || (String(error?.message || '').startsWith('Missing required env:') ? 501 : 500);
    return NextResponse.json({ error: error?.message || 'Failed to fetch pass' }, { status });
  }
}

